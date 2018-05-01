//
//  Container for a top-level component, which is to be rendered as a static string
//
import * as React from 'react'

export default ({ title = '', mainMarkup = '', mainProps = {} }) => (<html>
  <head>
    <meta charSet='utf-8' />
    <meta name='theme-color' content='#000000' />
    <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' />
    <title>{ title }</title>
    <script type='x-data' dangerouslySetInnerHTML={{ __html: JSON.stringify(mainProps) }} />
    <script async src='/app.js' />
  </head>
  <body>
    <div id='root' dangerouslySetInnerHTML={{ __html: mainMarkup }} />
  </body>
</html>)
