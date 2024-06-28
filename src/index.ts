import * as vscode from 'vscode'
import path from 'path'
import fs from 'fs'
// 引入 app.json 文件
import classDescriptions from './app.json'

function isInsideClassOrClassNameAttribute(
  document: vscode.TextDocument,
  position: vscode.Position
): boolean {
  const text = document.getText(
    new vscode.Range(new vscode.Position(0, 0), position)
  )
  const lastClassMatch = text.match(/class(Name)?=["'][^"']*$/)
  if (lastClassMatch) {
    const matchStart = text.lastIndexOf(lastClassMatch[0])
    const matchPosition = document.positionAt(matchStart)
    return matchPosition.isBeforeOrEqual(position)
  }
  return false
}

export function activate(context: vscode.ExtensionContext) {
  const rootPath = vscode.workspace.workspaceFolders
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined

  if (rootPath) {
    const configFilePath = path.join(rootPath, 'xmcss.config.ts')
    if (!fs.existsSync(configFilePath)) {
      return
    }

    // 注册补全项提供器
    let completionProvider = vscode.languages.registerCompletionItemProvider(
      { language: 'typescriptreact', scheme: 'file' },
      {
        provideCompletionItems(
          document: vscode.TextDocument,
          position: vscode.Position,
          token: vscode.CancellationToken,
          context: vscode.CompletionContext
        ) {
          if (!isInsideClassOrClassNameAttribute(document, position)) {
            return
          }

          const customClassNames = Object.keys(classDescriptions)
          const completionItems = customClassNames.map((className) => {
            const item = new vscode.CompletionItem(
              className,
              vscode.CompletionItemKind.Variable
            )
            item.insertText = className
            return item
          })
          return completionItems
        }
      },
      ' ' // 触发补全的字符
    )

    // 注册悬停提供器
    let hoverProvider = vscode.languages.registerHoverProvider(
      { language: 'typescriptreact', scheme: 'file' },
      {
        provideHover(
          document: vscode.TextDocument,
          position: vscode.Position,
          token: vscode.CancellationToken
        ) {
          if (!isInsideClassOrClassNameAttribute(document, position)) {
            return null
          }

          const range = document.getWordRangeAtPosition(position, /[\w-]+/)
          if (range) {
            const word = document.getText(range)
            const description =
              classDescriptions[word as keyof typeof classDescriptions]
            if (description) {
              return new vscode.Hover(description)
            }
          }
          return null
        }
      }
    )

    context.subscriptions.push(completionProvider)
    context.subscriptions.push(hoverProvider)
  }
}

export function deactivate() {}
