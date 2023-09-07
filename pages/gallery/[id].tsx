import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import { fetchItem } from 'pages/api/gallery/[id]'

export const getServerSideProps: GetServerSideProps<{
  id: string
  src: string
  publicId: string
  width: number
  height: number
}> = async ({ params }: GetServerSidePropsContext) => {
  const data = await fetchItem(params?.id as string)

  // TODO: throw if no data

  return {
    props: {
      id: data?.id ?? '',
      src: data?.image?.url ?? '',
      publicId: data?.image?.publicId ?? '',
      width: data?.image?.width ?? 0,
      height: data?.image?.height ?? 0,
    },
  }
}

const Image: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, src, publicId, width, height }): JSX.Element => {
  return (
    <div>
      <p>{id}</p>
      <p>{src}</p>
      <p>{publicId}</p>
      <p>{width}</p>
      <p>{height}</p>
    </div>
  )
}
export default Image
