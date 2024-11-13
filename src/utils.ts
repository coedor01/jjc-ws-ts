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

function getRoom(id: number | string) {
  return `ROOM-${id}`;
}

function getRoleLabel(server: string, name: string) {
  return `${server}·${name}`;
}

export { readLocalJsonFile, getRandomInt, getRoom, getRoleLabel };
