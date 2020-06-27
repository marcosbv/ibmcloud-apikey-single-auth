const IBMCloudApikeyAuthClient = require('./index')

async function main() {
    const authClient = new IBMCloudApikeyAuthClient({apikey: process.env.API_KEY, url: process.env.IAM_URL || 'https://iam.cloud.ibm.com'})
    
    const token1 = await authClient.getToken()
    console.log(token1)
    
    const token2 = await authClient.getToken()
    
    console.log(token1 === token2)
    
    const token3 = await authClient.getToken(true)
    console.log(token3)
    
    console.log(token1 !== token3)
    
    const service_creds = await authClient.getServiceCredentialByName('NO_EXIST')
    console.log(service_creds)

    // no options passed: expected env vars: IBMCLOUD_API_KEY and IBMCLOUD_IAM_URL
    const defaultAuthClient = new IBMCloudApikeyAuthClient({})
    const token4 = await defaultAuthClient.getToken()
    console.log(token4)

    const service_creds1 = await authClient.getServiceCredentialByName('Monitoring_User')
    console.log(service_creds1)

    const service_creds2 = await authClient.getServiceCredentialByName('MyPostgreSQL_Database')
    console.log(service_creds2)
}

main()