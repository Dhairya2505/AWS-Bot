import { tool } from "@langchain/core/tools";
import { provide_credentials } from "../utilities/credentials-provider.js";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from 'fs'
import { z } from 'zod'
import { get_error } from "../utilities/AI-error-helper.js";

export const upload_object_to_bucket = tool(
    async ({ name, file_name }) => {

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
                    }
                });

                const fileStream = fs.createReadStream(`${file_name}`);

                const filename = file_name.split('/')

                const parallelUploads3 = new Upload({
                    client,
                    params: {
                        Bucket: `${name}`,
                        Key: `${filename[filename.length - 1]}`,
                        Body: fileStream
                    },
                });

                parallelUploads3.on("httpUploadProgress", (progress) => {
                });
                await parallelUploads3.done();
                return 'file uploaded';
            } catch (error) {
                const err = await get_error(`${error}`)
                return err
            }
        } else {
            return `Invalid keys`
        }


    },
    {
        name: "upload_object_to_bucket",
        description: "uploads a provided file/object to a bucket",
        schema: z.object({
            name: z.string().describe("name of the bucket"),
            file_name: z.string().describe("name or path of the file")
        }),
    }
);