import path from 'path';
import fs from 'fs';

function readLocalJsonFile(fp: string) {
  // 构造文件的绝对路径
  const filePath = path.join(process.cwd(), '/public', fp);

  // 同步读取文件内容并解析 JSON
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(fileContents);
  return data;
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRoomLabel(id: number | string) {
  return `ROOM-${id}`;
}

function getRoleLabel(server: string, name: string) {
  return `${name}·${server}`;
}

function calculateBasicAuthNodeDecode(authHeader: string) {
  if (!authHeader.startsWith('Basic ')) {
    throw new Error('Invalid Basic Auth header');
  }

  // 获取 Base64 编码的部分
  const encodedCredentials = authHeader.slice(6);

  // 使用 Buffer 解码 Base64
  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString(
    'utf-8'
  );

  // 返回解码后的用户名和密码
  const [username, password] = decodedCredentials.split(':');
  return { username, password };
}

function getSTimestamp(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

export {
  readLocalJsonFile,
  getRandomInt,
  getRoomLabel,
  getRoleLabel,
  calculateBasicAuthNodeDecode,
  getSTimestamp,
};
