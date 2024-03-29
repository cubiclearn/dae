import Head from 'next/head'
import { Layout, TransferKarmaForm } from '@dae/ui'
import withCourseRoleAuth from '../../../../components/HOC/withCourseRole'

function TransferKarma() {
  return (
    <>
      <Head>
        <title>Karma | DAE</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout.Course heading="Transfer karma">
        <TransferKarmaForm />
      </Layout.Course>
    </>
  )
}

export default withCourseRoleAuth(TransferKarma, 'MAGISTER')
