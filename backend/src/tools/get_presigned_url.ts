import { tool } from "@langchain/core/tools";
import { provide_credentials } from "../utilities/credentials-provider.js";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { get_error } from "../utilities/AI-error-helper.js";
import { z } from 'zod';

export const get_presigned_url = tool(
    async ({ bucketName, imageName }) => {
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

                const command = new GetObjectCommand({ Bucket: bucketName, Key: imageName });
                const url = await getSignedUrl(client, command, { expiresIn: 100 });
                await client.send(command);
                return url;

            } catch (error) {
                const err = await get_error(`${error}`)
                return err
            }

        } else {
            return 'Invalid Keys';
        }

    },
    {
        name: "get_presigned_url",
        description: "Get URL for an image to access from S3 bucket",
        schema: z.object({
            bucketName: z.string().describe("name of the bucket"),
            imageName: z.string().describe("name of the image")
        }),
    }
);