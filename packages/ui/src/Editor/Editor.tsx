import { useMemo, useState } from 'react'
import { markdownToHtml, htmlToMarkdown } from './Parser'
import dynamic from 'next/dynamic'

import 'react-quill/dist/quill.snow.css'
import './Editor.css'

export interface EditorContentChanged {
  html: string
  markdown: string
}

export interface EditorProps {
  value?: string
  onChange?: (changes: EditorContentChanged) => void
  onBlur?: (event: FocusEvent) => void
  id?: string
  placeholder?: string
  isDisabled?: boolean
}

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike', 'blockquote', 'link'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  ['clean'],
]

export default function Editor(props: EditorProps) {
  const [value, setValue] = useState<string>(markdownToHtml(props.value || ''))
  const ReactQuill = useMemo(
    () => dynamic(() => import('react-quill'), { ssr: false }),
    [],
  )

  const onChange = (content: string) => {
    setValue(content)

    if (props.onChange) {
      props.onChange({
        html: content,
        markdown: htmlToMarkdown(content),
      })
    }
  }

  const onBlur = (
    _previousSelection: any,
    _source: any,
    _editor: React.ElementRef<typeof ReactQuill>,
  ) => {
    const focusEvent = new FocusEvent('blur', {
      bubbles: false,
      cancelable: false,
    })
    if (props.onBlur) {
      props.onBlur(focusEvent)
    }
  }

  return (
    <ReactQuill
      id={props.id}
      theme="snow"
      placeholder={props.placeholder}
      readOnly={props.isDisabled}
      modules={{
        toolbar: {
          container: TOOLBAR_OPTIONS,
        },
      }}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    />
  )
}
