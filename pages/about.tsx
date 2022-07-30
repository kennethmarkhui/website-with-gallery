import type { NextPage } from 'next'

const About: NextPage = () => {
  return (
    <div className="flex flex-wrap justify-between py-8 px-0">
      <div className="m-0 p-2 lg:max-w-[66.666667%] lg:grow-0 lg:basis-4/6">
        <p className="whitespace-pre-line leading-6">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore
          quos cum consequuntur aliquam, eos molestiae totam cupiditate eius
          labore id commodi? Et veritatis expedita neque animi deserunt, quia
          beatae debitis. Molestiae, corrupti obcaecati rem similique quaerat
          repellendus illum perspiciatis, accusantium placeat iure et cum? Hic
          totam repellat molestiae quisquam quis. Laboriosam ab, soluta cumque
          iusto aliquid facere sunt repudiandae? Dolorem. Dicta suscipit nulla
          laudantium atque nisi voluptate ex, libero ut? Adipisci,
          necessitatibus. Nesciunt vero dolor dolorem omnis deserunt nemo earum,
          voluptatum perferendis saepe adipisci veniam similique quis numquam
          quidem in.
        </p>
      </div>
      <div className="m-0 max-h-full w-full max-w-full p-2 lg:max-w-[33.333333%] lg:grow-0 lg:basis-2/6">
        <img src="https://placekitten.com/300/300" alt="placeholder" />
      </div>
    </div>
  )
}

export default About
