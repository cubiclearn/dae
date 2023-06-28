import Head from 'next/head'
import { Layout } from '@dae/ui'
import { Stack, Tabs, TabList, Tab } from '@chakra-ui/react'
import { CustomLink } from '@dae/ui'
import { CreateCourseForm } from '@dae/ui'

export default function AddCoursePage() {
  return (
    <>
      <Head>
        <title>Create Course | DAE</title>
        <meta name='description' content='Generated by create next app' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Layout.Profile heading='New Course'>
        <Stack spacing={8}>
          <Tabs defaultIndex={2}>
            <TabList>
              <CustomLink href='/profile/courses/teaching'>
                <Tab>Teaching</Tab>
              </CustomLink>
              <CustomLink href='/profile/courses/partecipating'>
                <Tab>Partecipating</Tab>
              </CustomLink>
              <Tab>Create</Tab>
            </TabList>
          </Tabs>
          <CreateCourseForm />
        </Stack>
      </Layout.Profile>
    </>
  )
}
