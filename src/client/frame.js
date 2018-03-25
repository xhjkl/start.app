//
//  Container for a top-level component, which is to be rendered as a static string
//
import { createElement as $ } from 'react'

export default ({ title = '', styles = [], mainMarkup = '', mainProps = {} }) => $('html', null,
  $('head', null,
    $('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }),
    $('title', null, title),
    $('script', { type: 'x-data', dangerouslySetInnerHTML: { __html: JSON.stringify(mainProps) } }),
    $('script', { async: true, src: '/app.js' }),
    ...styles
  ),
  $('body', null,
    $('div', { id: 'root', dangerouslySetInnerHTML: { __html: mainMarkup } })
  ),
)
