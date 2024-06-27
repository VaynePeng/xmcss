// 转换 less 为 css
import less from 'less'
import fs from 'fs'
import path from 'path'

export async function transformLessToCss(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const { css } = await less.render(content, {
    filename: path.resolve(filePath)
  })
  return css
}

transformLessToCss(path.join(__dirname, 'app.less')).then((css) => {
  console.log(css)
})
