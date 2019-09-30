//
//  Container for a top-level component, which is to be rendered as a static string
//
import * as React from 'react'
import { Request } from 'express' // eslint-disable-line no-unused-vars

export interface HostingComponentClass<Props = {}, State = {}, SS = any> {
  new(): React.Component<Props, State, SS>
  preparePropsWithRequest(request: Request): Props
}

export interface HostingComponentFunction<Props = {}> extends React.FunctionComponent<Props> {
  preparePropsWithRequest(request: Request): Props
}

/** Top-level component that could be used to serve a response. */
export type HostingComponent<Props = {}, State = {}, SS = any> =
  | HostingComponentClass<Props, State, SS>
  | HostingComponentFunction<Props>

const Frame = ({ title = '', mainMarkup = '', mainProps = {} }) => (
  <html>
    <head>
      <meta charSet='utf-8' />
      <meta name='theme-color' content='#000000' />
      <meta name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' />
      <title>{title}</title>
      <script type='x-data' dangerouslySetInnerHTML={{ __html: JSON.stringify(mainProps) }} />
      <script async src='/app.js' />
    </head>
    <body>
      <div id='root' dangerouslySetInnerHTML={{ __html: mainMarkup }} />
    </body>
  </html>
)

Frame.preparePropsWithRequest = () => {}

export default Frame
