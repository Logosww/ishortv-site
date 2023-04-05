import COS from 'cos-js-sdk-v5';

import type { ProgressInfo } from 'cos-js-sdk-v5';
import { nanoid } from 'nanoid';

const config = {
  bucketName: 'ishortv-1308682615',
  bucketRegion: 'ap-shanghai'
};

const cos = ref<COS>();

export const useCOSUpload = async (
  onProgress: (params: ProgressInfo) => void
) => {
  const { data: bucketSecret, refresh: getCOSSecret } = await useGetCOSSecret();

  if(!cos.value) cos.value = new COS({
    async getAuthorization(_options, callback) {
      await getCOSSecret();
      const data = bucketSecret.value;
      const { credentials } = data;
      callback({
        TmpSecretId: credentials.tmpSecretId,
        TmpSecretKey: credentials.tmpSecretKey,
        SecurityToken: credentials.sessionToken,
        StartTime: data.startTime,
        ExpiredTime: data.expiredTime
      });
      },
    }
  );

  const upload = (file: File, path?: string) => {
    const extension = file.name.split('.').at(-1);
    const generateKey = () => {
      const { type } = file;
      return `${ type === 'image/png' ? 'image' : 'temp' }/${nanoid()}.${extension}`
    };
    return new Promise<string>(async (resolve, reject) => {
      try {
        const key = path ?? generateKey();
        await cos.value!.uploadFile(
          {
            Bucket: config.bucketName,
            Region: config.bucketRegion,
            Key: key,
            Body: file,
            onProgress
          }
        );
        resolve(key);
      } catch(err) {
        reject(err)
      }
    });
  };

  return {
    upload
  };
};

