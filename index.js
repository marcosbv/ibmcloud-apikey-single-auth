/**
 * @package ibmcloud-apikey-single-auth
 * 
 * This package allows authentication to IBM Cloud platform and retrieval of IAM tokens and service credentials.
 * It uses a few packages to access IAM API calls thru a service ID API Key and exposes the following methods:
 * 
 * getToken() to get IAM tokens 
 * getServiceCredentialByName() to look for a service credential by name.
 */

const request = require('request-promise-native')
const jwt_decode = require('jwt-decode')

/**
 * Private function to retrieve OAuth tokens through IAM service.
 * @param {*} icp_url   Token endpoint to retrieve
 * @param {*} apikey    API Key to use
 * 
 * @returns             A Promise with a token as a String.
 */
async function issue_token(icp_url, apikey) {
    let request_options = {
        url: icp_url,
        form: {
            grant_type: "urn:ibm:params:oauth:grant-type:apikey",
            apikey: apikey,
        },
        headers: {
            'Accept' : 'application/json'
        },
        rejectUnauthorized: false,
        
    }

    return new Promise (function (resolve, reject) {
        request.post(request_options).then(function (response) {
            let json = JSON.parse(response)
            resolve(json.access_token);
        }).catch(function (err) {
            console.log("Erro ao capturar token: " + err);
            reject(err);
        });
    });

}

/**
 * Private funtion to make a GET request to an authenticated endpoint using a Bearer Token
 * @param {*} url         URL to call
 * @param {*} token       Bearer Token to use.
 * 
 * @returns               A Promise with a Response Object or an error if rejected.
 */
async function baseGetRequest(url, token) {
    let httpClient = this.httpClient

    let options = {
        url : url,
       
        headers: {
            'Authorization' : 'Bearer ' + token,
        }
    }
    return new Promise(function(resolve, reject) {
         request.get(options).then(function(response) {
             resolve(response)
         }).catch(function(err) {
             console.log("Error while executing GET request: " + err)
             reject(err)
         }) 
    })
}

/**
 * Get Resource Keys thru IBM Resource Controller APIs
 * @param {*} token     Bearer Token to request with.
 * 
 * @returns             A Promise with a Response Object or an error if rejected.
 */
async function getResourceKeys(token) {
    return baseGetRequest('https://resource-controller.cloud.ibm.com/v2/resource_keys', token)
}

/**
 * Class to implement a tiny client to authenticate to IBM Cloud Platform using API Keys.
 * 
 * The constructor will receive an Options object, that can be the following info:
 * -> apikey : API Key to authenticate to the authentication system
 * -> url:     URL to authenticate to the authentication system
 * 
 * Both of parameters are optional. Environment variables IBMCLOUD_API_KEY and IBMCLOUD_IAM_URL 
 * can be used instead to give the library the needed information.
 * 
 * The main use case to use this library is authentication using service user IDs. In this approach,
 * each service (in this context, service means a set of cloud resources to deliver a bunch of related 
 * features) can have a single Service User ID with the needed policies to access their cloud resources.
 * An API Key is issued and used to access services. Two possible ways to access Cloud Resource APIs:
 * 
 * - using IAM tokens (Watson services, Cloudant, COS buckets and many other IBM Cloud services have support to this)
 * - using Service Credentials (IBM Cloud Databases, DB2, Blockchain Platform and others) - in this scenario, we can retrieve a Credential thru its name.
 */
class IBMCloudApikeyAuthClient {
    
        /**
         * Constructor method.
         * @param {*} options 
         */
        constructor(options) {
           this.apikey = options.apikey || process.env.IBMCLOUD_API_KEY
           this.url = options.url || process.env.IBMCLOUD_IAM_URL || "https://iam.cloud.ibm.com"
           this.token = null;

           if(this.apikey == null) {
               throw new Error('\nError initializing class: API Key not found.\nDeclare it in the options object or in an environment variable named IBMCLOUD_API_KEY.\n' )
           }
        }
    
        /**
         * Get an IAM token. This token can be used to access several IBM Cloud API services, like Watson Services, Cloudant and so on.
         * This method tries to cache the token in the memory until it expires.
         * 
         * @param {*} force        If a new token must be taken even there is a valid token in cache
         * 
         * @returns                A Promise with a Bearer Token as a String.
         */
        async getToken(force=false) {
            let icp_url = `${this.url}/identity/token` ;
            if(this.token!=null && !force) {
                const token_data = jwt_decode(this.token)
                const expiration_time = token_data.exp * 1000
                const nowMinus1Minute = Date.now() - 60000
                if(expiration_time < nowMinus1Minute) {
                    this.token = await issue_token(icp_url, this.apikey)
                }
            } else {
                this.token = await issue_token(icp_url, this.apikey)
            }
           
            return this.token;
        }
       
        /**
         * Gets a credential by Service Credential Name.
         * It is important that the User that owns the API Key used in constructor has access to it.
         * 
         * @param {*} key_name       Service Credential Name to look for.
         * 
         * @returns                  A Promise with an object containing the following attributes:
         *                           status: NOT_FOUND or SUCCESS
         *                           credentials: Credentials to access the resource (its structure depends on the Cloud Service resource)
         *                           errorMessage: An error message if not successful.
         */
        async getServiceCredentialByName(key_name) {
            
            return new Promise(async (resolve, reject) => {
                try {
                    const token = await this.getToken()
                    let responseStr = await getResourceKeys(token)
                    
                    let response = JSON.parse(responseStr)
                    if(response.rows_count > 0) {
                        let filtered = response.resources.filter(resource => {
                             return resource.name == key_name
                        })

                        if(filtered.length == 0) {
                            resolve({credentials: {}, status: 'NOT_FOUND', errorMessage: 'No key found'})
                        } else {
                            resolve({credentials: filtered[0].credentials, status: 'SUCCESS'})
                        }
                    }
                } catch(err) {
                    reject(err)
                }
                
            })
        }

    }
 
/**
 * Class export.
 */
 module.exports=IBMCloudApikeyAuthClient;
    
    