import Mock from 'mockjs';

import type { templateOrFn } from 'mockjs';

const Random = Mock.Random;
type MockOptions = Record<string, templateOrFn>;

const mocks: MockOptions = {
  'login': {
    data: Random.string(10),
      code: 200,
      msg: '登录成功' 
  },
  'register': {
    data: Random.string(10),
    code: 200,
    msg: '注册成功'
  },
  'logout': {
    data: null,
    code: 200,
    msg: '登出成功'
  },
  'getBannerVideos': {
    data: [
      Mock.mock({
        coverUrl: 'https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg',
        title: Random.cparagraph(1),
        key: Random.string(),
        coverThemeColor: '#cebdb4'
      }),
      Mock.mock({
        coverUrl: 'https://cdn.vuetifyjs.com/images/carousel/sky.jpg',
        title: Random.cparagraph(1),
        key: Random.string(),
        coverThemeColor: '#b39354'
      }),
      Mock.mock({
        coverUrl: 'https://cdn.vuetifyjs.com/images/carousel/bird.jpg',
        title: Random.cparagraph(1),
        key: Random.string(),
        coverThemeColor: '#ae9272'
      }),
      Mock.mock({
        coverUrl: 'https://cdn.vuetifyjs.com/images/carousel/planet.jpg',
        title: Random.cparagraph(1),
        key: Random.string(),
        coverThemeColor: '#0a2732'
      }),
      Mock.mock({
        coverUrl: 'https://cdn.vuetifyjs.com/images/cards/docks.jpg',
        title: Random.cparagraph(1),
        key: Random.string(),
        coverThemeColor: '#3f5d95'
      })
    ],
    code: 200,
    msg: '请求成功'
  }
};

export default defineEventHandler(event => {
  const paths = event.path?.split('/');
  let response;
  if(paths && paths[1] === 'api') {
    const api = paths[2];
    response = mocks[api];
  }
  return response;
});