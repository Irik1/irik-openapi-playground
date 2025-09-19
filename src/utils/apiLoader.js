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
 * Get all folders in the S3 bucket
 * @param {string} bucketName - S3 bucket name
 * @param {string} prefix - S3 prefix to search under
 * @returns {Promise<Array>} Array of folder names
 */
const getFolders = async (bucketName, prefix) => {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      Delimiter: '/'
    });
    
    const response = await s3Client.send(listCommand);
    return response.CommonPrefixes?.map(prefix => prefix.Prefix) || [];
  } catch (error) {
    console.error('❌ Error listing folders:', error.message);
    return [];
  }
};

/**
 * Get all YAML files in a specific folder
 * @param {string} bucketName - S3 bucket name
 * @param {string} folderPrefix - Folder prefix to search in
 * @returns {Promise<Array>} Array of YAML file keys
 */
const getYamlFilesInFolder = async (bucketName, folderPrefix) => {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: folderPrefix,
    });
    
    const response = await s3Client.send(listCommand);
    
    if (!response.Contents) {
      return [];
    }
    
    return response.Contents
      .map(obj => obj.Key)
      .filter(key => key.endsWith('.yaml') || key.endsWith('.yml'))
      .filter(key => key !== folderPrefix); // Exclude the folder itself
  } catch (error) {
    console.error(`❌ Error listing files in folder ${folderPrefix}:`, error.message);
    return [];
  }
};

/**
 * Dynamically load all OpenAPI specifications from S3 bucket with folder-based structure
 * @returns {Promise<Object>} Object containing loaded API specifications
 */
const loadApiSpecs = async () => {
  const apiSpecs = {};
  const bucketName = process.env.S3_BUCKET_NAME || 'ewa-documentation';
  const prefix = process.env.S3_OPENAPI_PREFIX || 'openapi/';
  
  try {
    // Get all folders in the openapi directory
    const folders = await getFolders(bucketName, prefix);
    
    console.log(`📁 Found ${folders.length} API folder(s): ${folders.map(f => f.replace(prefix, '').replace(/\/$/, '')).join(', ')}`);
    
    if (folders.length === 0) {
      console.log('No API folders found, falling back to flat structure');
      // Fallback to old flat structure
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      });
      
      const response = await s3Client.send(listCommand);
      
      if (!response.Contents) {
        console.log('No OpenAPI documents found in S3 bucket');
        return apiSpecs;
      }
      
      // Process each OpenAPI document in flat structure
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
                s3Key: key,
                folder: 'default',
                fileName: fileName
              };
              console.log(`✅ Loaded API from S3 (flat): ${fileName} (${apiSpecs[fileName].title} v${apiSpecs[fileName].version})`);
            }
          } catch (error) {
            console.error(`❌ Error processing ${fileName}:`, error.message);
          }
        }
      }
    } else {
      // Process each folder
      for (const folder of folders) {
        const folderName = folder.replace(prefix, '').replace(/\/$/, '');
        const yamlFiles = await getYamlFilesInFolder(bucketName, folder);
        
        console.log(`📄 Processing folder '${folderName}' with ${yamlFiles.length} YAML file(s)`);
        
        // Process each YAML file in the folder
        for (const key of yamlFiles) {
          const fileName = key.split('/').pop().replace(/\.(yaml|yml)$/, '');
          
          // Create unique API key: folder-file (e.g., "crm-crm", "words-words")
          const apiKey = `${folderName}-${fileName}`;
          
          try {
            const spec = await fetchOpenApiFromS3(key);
            if (spec) {
              apiSpecs[apiKey] = {
                spec: spec,
                title: spec.info?.title || fileName,
                version: spec.info?.version || '1.0.0',
                description: spec.info?.description || `API documentation for ${fileName}`,
                s3Key: key,
                folder: folderName,
                fileName: fileName
              };
              console.log(`✅ Loaded API from S3: ${apiKey} (${apiSpecs[apiKey].title} v${apiSpecs[apiKey].version})`);
            }
          } catch (error) {
            console.error(`❌ Error processing ${apiKey}:`, error.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error loading API specifications:', error.message);
  }
  
  return apiSpecs;
};

module.exports = {
  loadApiSpecs
};
