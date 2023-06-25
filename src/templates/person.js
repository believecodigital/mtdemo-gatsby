import React from "react"
import { graphql } from "gatsby"
import { GatsbyImage } from "gatsby-plugin-image"
import parse from "html-react-parser"

// We're using Gutenberg so we need the block styles
// these are copied into this project due to a conflict in the postCSS
// version used by the Gatsby and @wordpress packages that causes build
// failures.
// @todo update this once @wordpress upgrades their postcss version
import "../css/@wordpress/block-library/build-style/style.css"
import "../css/@wordpress/block-library/build-style/theme.css"

import Layout from "../components/layout"
import Seo from "../components/seo"

const PersonTemplate = ({ data: { person } }) => {
  const featuredImage = {
  }
  console.log('XXX' + person);

  return (
    <Layout>
      <Seo title={person.title} description={person.excerpt} />

      <article
        className="person"
        itemScope
        itemType="http://schema.org/Person"
      >
        <header>
          <h1 itemProp="headline">{parse(person.title)}</h1>

          {/* if we have a featured image for this page let's display it */}
          {featuredImage?.data && (
            <GatsbyImage
              image={featuredImage.data}
              alt={featuredImage.alt}
              style={{ marginBottom: 50 }}
            />
          )}
        </header>

        {!!person.content && (
          <section itemProp="articleBody">{parse(person.content)}</section>
        )}

        <hr />

      </article>

    </Layout>
  )
}

export default PersonTemplate

export const pageQuery = graphql`
  query PersonById(
    $id: String!
  ) {
    person: wpPerson(id: { eq: $id }) {
      id
      uri
      content
      title
      featuredImage {
        node {
          altText
          localFile {
            childImageSharp {
              gatsbyImageData(
                quality: 100
                placeholder: TRACED_SVG
                layout: FULL_WIDTH
              )
            }
          }
        }
      }
    }
  }
`
