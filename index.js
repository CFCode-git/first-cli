#!/usr/bin/env node
// 使用Node开发命令行工具所执行的JavaScript脚本必须在顶部加入 #!/usr/bin/env node 声明

const program = require('commander')
const download = require('download-git-repo')
const inquirer = require('inquirer')
const ora = require('ora')
const chalk = require('chalk')
const packageData = require('./package.json')
const fs = require('fs')
const path = require('path')
const { DH_CHECK_P_NOT_SAFE_PRIME } = require("constants");
// const handlebars = require("handlebars");
// const logSymbols = require("log-symbols");

const templates = {
  'vue2+ts': {
    url: 'https://github.com/CFCode-git/first-cli-vue2', 
    downloadUrl: 'https://github.com:CFCode-git/first-cli-vue2#main',
    description: '使用vue-cli创建',
  },
  'vue3+ts': {
    url: 'https://github.com/CFCode-git/first-cli-vue3',
    downloadUrl: 'https://github.com:CFCode-git/first-cli-vue3#main',
    description: '使用vue-cli创建',
  },
  'vue3+vite+ts': {
    url: 'https://github.com/CFCode-git/first-cli-vue3-vite',
    downloadUrl: 'https://github.com:CFCode-git/first-cli-vue3-vite#main',
    description: '使用create-vite-app创建',
  },
  'react+ts': {
    url: 'https://github.com/CFCode-git/first-cli-react',
    downloadUrl: 'https://github.com:CFCode-git/first-cli-react#main',
    description: '使用create-react-app创建',
  },
}

program
  .version(packageData.version)
  .option("-I,--init", "项目初始化")
  .option("-L,--list", "模板列表")
program.parse(process.argv)

if (program.opts() && program.opts().list) {
  for (let key in templates) {
    console.log(` - ${key}:${templates[key].description}`)
  }
}

if (program.opts() && program.opts().init) {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'projectName',
        message: '请输入项目名称'
      },
      {
        type: 'input',
        name: 'description',
        message: '请输入项目介绍'
      },
      {
        type: 'input',
        name: 'author',
        message: '请输入开发者名称'
      },
      {
        type: 'list',
        name: 'template',
        message: '请选择开发模板',
        choices: [
          "vue2+ts (vue2+ts项目模板)",
          "vue3+ts (vue3+ts项目模板)",
          "vue3+vite+ts (vue3+vite+ts项目模板)",
          "react+ts (react+ts项目模板)",
        ]
      }
    ])
    .then(customMessage => {
      const templatesKey = customMessage.template.split(" ")[0]
      console.log('选择模板: ' + templatesKey)
      const downloadUrl = templates[templatesKey].downloadUrl
      initTemplateDefault(customMessage, downloadUrl)
    })
}

async function initTemplateDefault(customMessage, downloadUrl) {
  console.log(
    chalk.bold.cyan('firstCli: ' + 'will create a new project')
  )

  const { projectName="" } = customMessage
  // console.log(customMessage)
  // console.lame)

  try {
    await checkProjectName(projectName)
    await downloadTemplate(downloadUrl, projectName)
    await changeTemplate(customMessage)

    console.log(chalk.green("template download completed"))
    console.log(
      chalk.bold.cyan("firstCli: ") + "a new project is created, enjoy~"
    )
  } catch (error) {
    console.log(chalk.red(error))
  }
}

/**
 * 检查项目名是否存在
 * @param {string} name 
 */
function checkProjectName(name) {
  return new Promise((resolve, reject) => {
    const projectPath = process.cwd()
    fs.readdir(projectPath, (error, data) => {
      if (error) {
        reject(error)
      }
      if (data.includes(name)) {
        return reject(new Error(`${name} is already exists!`))
      }
      resolve()
    })
  })
}

/**
 * 下载模板
 * @param {string} downloadUrl 
 * @param {string} name 
 */
function downloadTemplate(downloadUrl, projectName) {
  const spinner = ora('template downloading, please hold on ...').start()
  return new Promise((resolve, reject) => {
    const projectPath = path.resolve(process.cwd(), projectName)
    download(
      downloadUrl,
      projectPath,
      { clone: true },
      function (error) {
        if (error) {
          return reject(error)
          spinner.fail()
        }
        spinner.succeed()
        resolve()
      }
    )
  })
}

async function changeTemplate(customMessage) {
  const { projectName = '', description = '', author = '' } = customMessage
  return new Promise((resolve, reject) => {
    const packageJsonPath = path.resolve(process.cwd(), projectName, 'package.json')
      // console.log(path.resolve(process.cwd(), projectName, 'package.json'))
    fs.readFile(
      packageJsonPath,
      'utf8',
      (error, data) => {
        if (error) {
          return reject(error)
        }
        const packageContent = JSON.parse(data)
        packageContent.name = projectName
        packageContent.author = author
        packageContent.description = description
        fs.writeFile(
          packageJsonPath,
          JSON.stringify(packageContent,null,2),
          'utf8',
          (error, data) => {
            if (error) {
              return reject(error)
            }
            resolve()
          }
        )
      }
    )
  })
}