import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { provide_credentials } from "../utilities/credentials-provider.js";
import { CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { get_error } from "../utilities/AI-error-helper.js";


export const create_S3_bucket = tool(
    async ({ name }) => {
        const creds = await provide_credentials("S3")
        const access_key = creds.Credentials?.AccessKeyId
        const secret_access_key = creds.Credentials?.SecretAccessKey
        const session_token = creds.Credentials?.SessionToken

        if (access_key && secret_access_key && session_token) {

            try {
                const client = new S3Client({
                    credentials: {
                        accessKeyId: access_key,
                        secretAccessKey: secret_access_key,
                        sessionToken: session_token
                    },
                    region: 'ap-south-1'
                });

                const command = new CreateBucketCommand({
                    Bucket: name
                });
                await client.send(command);

                return 'Bucket created successfuly';

            } catch (error) {
                const err = await get_error(`${error}`)
                return err
            }

        } else {
            return 'Invalid Keys';
        }

    },
    {
        name: "create_S3_bucket",
        description: "creates an AWS S3 bucket",
        schema: z.object({
            name: z.string().describe("name of the bucket")
        }),
    }
);