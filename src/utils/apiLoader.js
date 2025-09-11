const YAML = require('yamljs');
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Fetch OpenAPI specification from S3
 * @param {string} key - S3 object key
 * @returns {Promise<Object|null>} Parsed YAML object or null if error
 */
const fetchOpenApiFromS3 = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'ewa-documentation',
      Key: key,
    });
    
    const response = await s3Client.send(command);
    const yamlContent = await response.Body.transformToString();
    return YAML.parse(yamlContent);
  } catch (error) {
    console.error(`❌ Error fetching ${key} from S3:`, error.message);
    return null;
  }
};

/**
 * Dynamically load all OpenAPI specifications from S3 bucket
 * @returns {Promise<Object>} Object containing loaded API specifications
 */
const loadApiSpecs = async () => {
  const apiSpecs = {};
  const bucketName = process.env.S3_BUCKET_NAME || 'ewa-documentation';
  const prefix = process.env.S3_OPENAPI_PREFIX || 'openapi/';
  
  try {
    // List all objects in the openapi folder
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });
    
    const response = await s3Client.send(listCommand);
    
    if (!response.Contents) {
      console.log('No OpenAPI documents found in S3 bucket');
      return apiSpecs;
    }
    
    // Process each OpenAPI document
    for (const object of response.Contents) {
      const key = object.Key;
      
      // Skip if not a YAML file or if it's a directory
      if (!key.endsWith('.yaml') && !key.endsWith('.yml')) {
        continue;
      }
      
      // Extract API name from the key (e.g., "openapi/context-translation.yaml" -> "context-translation")
      const fileName = key.replace(prefix, '').replace(/\.(yaml|yml)$/, '');
      
      if (fileName) {
        try {
          const spec = await fetchOpenApiFromS3(key);
          if (spec) {
            apiSpecs[fileName] = {
              spec: spec,
              title: spec.info?.title || fileName,
              version: spec.info?.version || '1.0.0',
              description: spec.info?.description || `API documentation for ${fileName}`,
              s3Key: key
            };
            console.log(`✅ Loaded API from S3: ${fileName} (${apiSpecs[fileName].title} v${apiSpecs[fileName].version})`);
          }
        } catch (error) {
          console.error(`❌ Error processing ${fileName}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error listing S3 objects:', error.message);
  }
  
  return apiSpecs;
};

module.exports = {
  loadApiSpecs
};
