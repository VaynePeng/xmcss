// 转换 less 为 css
import less from 'less'
import fs from 'fs'
import path from 'path'

const transformLessToCss = async (filePath: string): Promise<string> => {
  const content = fs.readFileSync(filePath, 'utf-8')
  const { css } = await less.render(content, {
    filename: path.resolve(filePath)
  })
  return css
}

function transformCssToObject(css: string): Record<string, string> {
  const result: Record<string, string> = {}
  let currentSelector = ''
  css.split('\n').forEach((line) => {
    if (line.includes('{')) {
      // 提取选择器名称，去掉点和空格
      currentSelector = line.replace(/\{/, '').trim().replace('.', '')
    } else if (line.includes('}')) {
      currentSelector = '' // 重置当前选择器
    } else if (currentSelector && line.trim()) {
      // 如果当前行是样式定义，将其添加到结果对象中
      const [key, value] = line.split(':')
      if (key && value) {
        // 确保当前选择器的样式是以对象形式存储的
        if (!result[currentSelector]) {
          result[currentSelector] = `{ ${key.trim()}: ${value.trim()} }`
        } else {
          // 如果已经有样式，追加新的样式
          const existingStyle = result[currentSelector].slice(0, -2) // 去掉末尾的 " }"
          result[
            currentSelector
          ] = `${existingStyle} ${key.trim()}: ${value.trim()} }`
        }
      }
    }
  })
  return result
}

transformLessToCss(path.join(__dirname, 'app.less')).then((css) => {
  const result = transformCssToObject(css)
  fs.writeFileSync(path.join(__dirname, 'app.css'), css)
  fs.writeFileSync(path.join(__dirname, '../app.json'), JSON.stringify(result))
})
