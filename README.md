# IBM Cloud API Key Single Auth Library

Implements a tiny client to authenticate to IBM Cloud Platform using API Keys.
  
 The constructor will receive an Options object, that can be the following info:
 * apikey : API Key to authenticate to the authentication system
 * url:     URL to authenticate to the authentication system

Both of parameters are optional. Environment variables *IBMCLOUD_API_KEY* and *IBMCLOUD_IAM_URL* 
can be used instead to give the library the needed information.
 
The main use case to use this library is authentication using service user IDs. In this approach,
each service (in this context, service means a set of cloud resources to deliver a bunch of related 
features) can have a single Service User ID with the needed policies to access their cloud resources.
An API Key is issued and used to access services. Two possible ways to access Cloud Resource APIs:
 
 * using IAM tokens (Watson services, Cloudant, COS buckets and many other IBM Cloud services have support to this)
 * using Service Credentials (IBM Cloud Databases, DB2, Blockchain Platform and others) - in this scenario, we can retrieve a Credential thru its name.

## Usage

Below an example of usage:

```javascript
const IBMCloudApikeyAuthClient = require('@marcosbv/ibmcloud-apikey-single-auth')

// instantiate a new client object 
const ibmcloudclient = new IBMCloudApikeyAuthClient({apikey: 'UJkTPJ548m8PtDGkP2ZumxEEvPwn-VVzLCvqxJjmF4w1'})

// issue a new token
ibmcloudclient.getToken().then((token) => {
    console.log(token)
})
/* output: eyJraWQiOiIyMDIwMDYyNDE4MzAiLCJhbGciOiJSUzI1NiJ9.eyJpYW1faWQiOiJpYW0tU2VydmljZUlkLTRlNDhiNGZiLTNjY2MtNDE0Mi1iMzQwLTE5OGVjNGFiZTdiZiIsImlkIjoiaWFtLVNlcnZpY2VJZC00ZTQ4YjRmYi0zY2NjLTQxNDItYjM0MC0xOThlYzRhYmU3YmYiLCJyZWFsbWlkIjoiaWFtIiwiaWRlbnRpZmllciI6IlNlcnZpY2VJZC00ZTQ4YjRmYi0zY2NjLTQxNDItYjM0MC0xOThlYzRhYmU3YmYiLCJuYW1lIjoiX2FwcC11c2FnZS1yZXBvcnQiLCJzdWIiOiJTZXJ2aWNlSWQtNGU0OGI0ZmItM2NjYy00MTQyLWIzNDAtMTk4ZWM0YWJlN2JmIiwic3ViX3R5cGUiOiJTZXJ2aWNlSWQiLCJhY2NvdW50Ijp7InZhbGlkIjp0cnVlLCJic3MiOiIzZTgxOTI2MGQ0ZjM0MGMwOTk5MjQwZTkwOWQ2MWEwOCJ9LCJpYXQiOjE1OTMyMDg1NDcsImV4cCI6MTU5MzIxMjE0NywiaXNzIjoiaHR0cHM6Ly9pYW0uY2xvdWQuaWJtLmNvbS9pZGVudGl0eSIsImdyYW50X3R5cGUiOiJ1cm46aWJtOnBhcmFtczpvYXV0aDpncmFudC10eXBlOmFwaWtleSIsInNjb3BlIjoiaWJtIG9wZW5pZCIsImNsaWVudF9pZCI6ImRlZmF1bHQiLCJhY3IiOjEsImFtciI6WyJwd2QiXX0.r7Jd0kKBR7llsDq_xroWqjVxkyoFG3CcRMbjY8WHjlDGw0rVYPTo3_ZAXBzdjthEyDYZUTmAlkt4j5ELUyhvIE3_Re90yi0wBDxZMggEbEOSd6Xq19ybBK13mG3pd4Q2ShWMVwPWBSU4IIFlado-bSBSSgqaVEmtbNOVbMAnQT5g3oCeruDdy5pxFjqJuxPgPqtraayFdpqn19ZqgPlRVHHWp1Cn3SDYaGHmGvZkJZkNs3pXlOpa4eWbcrjcTriFOsbOP9zvIHyY_M8M4_s78H7-RD_uhc_TvEvWedp5srMJcV5SJ0QYaO3aXrZ48sC1kbTlhVnt2rX6OH7z68hfxg
*/

ibmcloudclient.getServiceCredentialByName('My_PostgreSQL_Credentials').then((creds) => {
    console.log(creds)
})

/* output:
{ credentials:
   { connection: { cli: [Object], postgres: [Object] },
     instance_administration_api:
      { deployment_id:
         'crn:v1:bluemix:public:databases-for-postgresql:us-south:a/3e819260d4f340c0999240e909d61a08:5489566b-aa22-4e9b-9cc1-cc861f0b148a::',
        instance_id:
         'crn:v1:bluemix:public:databases-for-postgresql:us-south:a/3e819260d4f340c0999240e909d61a08:5489566b-aa22-4e9b-9cc1-cc861f0b148a::',
        root: 'https://api.us-south.databases.cloud.ibm.com/v4/ibm' } },
  status: 'SUCCESS' }
*/
```

### getToken(force)

Get an IAM token. This token can be used to access several IBM Cloud API services, like Watson Services, Cloudant and so on.
This method tries to cache the token in the memory until it expires.

force (optional): If a new token must be taken even there is a valid token in cache
Returns a Promise with a Bearer Token as a String.

### getServiceCredentialByName(key_name)

Gets a credential by Service Credential Name.
It is important that the User that owns the API Key used in constructor has access to it.

key_name (required): Service Credential Name to look for.
Returns a Promise with an object containing the following attributes:
- status: NOT_FOUND or SUCCESS
- credentials: Credentials to access the resource (its structure depends on the Cloud Service resource)
- errorMessage: An error message if not successful. 



