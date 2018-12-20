This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## 环境搭建
【##1##】NodeJs环境
http://www.cnblogs.com/yominhi/p/7039795.html

webpack开发工具
https://www.cnblogs.com/vipstone/p/7125338.html

webpack官方配置
https://webpack.docschina.org/configuration/

【package.json配置说明】
https://sorrycc.gitbooks.io/spm-handbook/content/package.json/README.html

==================
【##2##】下载需要的库或者文件可以通过命令(npm/cnpm)来下载(*2)。
npm/cnpm install jquery@1.12.1 --save/--save-dev
【--save】：将保存配置信息至package.json（package.json是nodejs项目配置文件）；
【-dev】：保存至package.json的devDependencies节点，不指定-dev将保存至dependencies节点；
-- 生成文件夹 [node_modules]
    该文件夹是存放下载的各种库文件,然后将下载的文件移动到3rd_module中，以便在项目中依赖使用。

*2: NPM使用介绍：
http://www.runoob.com/nodejs/nodejs-npm.html


==================
【##3##】项目安装
进入【package.json】目录下 在cmd中执行下列命令即可
npm install

该命令会自动将项目所依赖的所有工具包下载并依赖

然后 参照下面的路径 执行  npm run start/build
https://segmentfault.com/a/1190000015301231
