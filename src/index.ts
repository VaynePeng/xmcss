import * as vscode from 'vscode'

const classDescriptions: { [key: string]: string } = {
  'custom-class1': 'This is the description for custom-class1.',
  'custom-class2': 'This is the description for custom-class2.',
  'custom-class3': 'This is the description for custom-class3.'
}

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
    ' ' // 触发补全的字符，这里使用点号 (.)
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
          const description = classDescriptions[word]
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

export function deactivate() {}
