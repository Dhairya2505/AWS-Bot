import AWS from 'aws-sdk';
import { provide_credentials } from '../utilities/credentials-provider.js';
import { get_error } from '../utilities/AI-error-helper.js';
import { config } from 'dotenv';
import { tool } from '@langchain/core/tools';
config();

const params = {
  Filters: [
    {
      Name: 'instance-state-name',
      Values: ['running']
    }
  ]
};


export const get_ec2_instances = tool(
    async () => {
        const creds = await provide_credentials("S3")
        const access_key = creds.Credentials?.AccessKeyId
        const secret_access_key = creds.Credentials?.SecretAccessKey
        const session_token = creds.Credentials?.SessionToken

        if (access_key && secret_access_key && session_token) {

            try {

              const ec2 = new AWS.EC2({
                  credentials: {
                      accessKeyId: access_key,
                      secretAccessKey: secret_access_key,
                      sessionToken: session_token
                  },
                  region: 'ap-south-1'
              });
              let instances: any = []
              const data = await ec2.describeInstances({}).promise();
              data.Reservations?.forEach((reservation) => {
                reservation.Instances?.forEach((instance) => {
                  instances.push({
                    InstanceId: instance.InstanceId,
                    Type: instance.InstanceType,
                    PublicIP: instance.PublicIpAddress,
                    LaunchTime: instance.LaunchTime,
                  });
                });
              });

              if (instances.length === 0) {
                return "No instances running";
              }
      
              let str = "Running EC2 Instances: ";
              for (const instance of instances) {
                str += "\n" + instance.InstanceId + ", ";
              }
      
              return str;

            } catch (error) {
                const err = await get_error(`${error}`)
                return err
            }

        } else {
            return 'Invalid Keys';
        }

    },
    {
        name: "get_ec2_instances",
        description: "Get all the EC2 instances",
    }
);