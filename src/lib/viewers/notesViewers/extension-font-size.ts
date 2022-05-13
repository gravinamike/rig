/* This is not a standard TipTap extension. It's a custom extension built by
Mike Gravina for use in the Rig project. */

import { Extension } from '@tiptap/core'
import '@tiptap/extension-text-style'

export type FontSizeOptions = {
  types: string[],
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (fontSize: number) => ReturnType,
      /**
       * Unset the font size
       */
      unsetFontSize: () => ReturnType,
    }
  }
}

export const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }

              return {
                style: `font-size: ${String(attributes.fontSize).replace(/(pt$)/, '')}pt`, // First remove any trailing "pt" to prevent duplication.
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})
