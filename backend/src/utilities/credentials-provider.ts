import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { config } from "dotenv";
config();

export const provide_credentials = async (name: string) => {
    const access_key = process.env.ACCESS_KEY
    const secret_access_key = process.env.SECRET_ACCESS_KEY

    if(access_key && secret_access_key){
        const client = new STSClient({
          credentials: {
            accessKeyId: access_key,
            secretAccessKey: secret_access_key
          },
          region: "ap-south-1"
        });
    
        const role_arn = process.env.ROLE_ARN
        const command = new AssumeRoleCommand({
          RoleArn: role_arn,
          RoleSessionName: `${name}-${Date.now()}`,
          DurationSeconds: 900
        })
    
        const response = await client.send(command);
        return response;
    } else {
        return {
            Credentials: {
                AccessKeyId: null,
                SecretAccessKey: null,
                SessionToken: null
            }
        }
    }

}