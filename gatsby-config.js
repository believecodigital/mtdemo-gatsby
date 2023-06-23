/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    siteUrl: `https://www.yourdomain.tld`,
  },
  plugins: [
    `gatsby-plugin-netlify`,
    {
      resolve: `gatsby-source-wordpress`,
      options: {
        url: `https://zyncagency.wpengine.com/graphql`,
      },
    }
  ],
}
