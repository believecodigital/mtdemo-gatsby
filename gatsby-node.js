const path = require('path')
const chunk = require('lodash/chunk')

// This is a simple debugging tool
// dd() will prettily dump to the terminal and kill the process
// const { dd } = require('dumper.js')

/**
 * exports.createPages is a built-in Gatsby Node API.
 * It's purpose is to allow you to create pages for your site! 💡
 *
 * See https://www.gatsbyjs.com/docs/node-apis/#createPages for more info.
 */
exports.createPages = async gatsbyUtilities => {
  // Query our posts from the GraphQL server
  const posts = await getPosts(gatsbyUtilities)
  const pages = await getPages(gatsbyUtilities)
  const people = await getPeople(gatsbyUtilities)

  // If there are no posts in WordPress, don't do anything
  if (!posts.length) {
    return
  }

  // If there are posts, create pages for them
  await createIndividualBlogPostPages({ posts, gatsbyUtilities })

  // And a paginated archive
  //await createBlogPostArchive({ posts, gatsbyUtilities })

  if (!pages.length) {
    return
  }

  // If there are pages, create pages for them
  await createIndividualPagePages({ pages, gatsbyUtilities })

  if (!people.length) {
    return
  }

  // If there are people, create pages for them
  await createIndividualPeoplePages({ people, gatsbyUtilities })

}

/**
 * This function creates all the individual blog pages in this site
 */
const createIndividualBlogPostPages = async ({ posts, gatsbyUtilities }) =>
  Promise.all(
    posts.map(({ previous, post, next }) =>
      // createPage is an action passed to createPages
      // See https://www.gatsbyjs.com/docs/actions#createPage for more info
      gatsbyUtilities.actions.createPage({
        // Use the WordPress uri as the Gatsby page path
        // This is a good idea so that internal links and menus work 👍
        path: post.languageCode + '/' + post.uri,

        // use the blog post template as the page component
        component: path.resolve('./src/templates/blog-post.js'),

        // 'context' is available in the template as a prop and
        // as a variable in GraphQL.
        context: {
          // we need to add the post id here
          // so our blog post template knows which blog post
          // the current page is (when you open it in a browser)
          id: post.id,

          // We also use the next and previous id's to query them and add links!
          previousPostId: previous ? previous.id : null,
          nextPostId: next ? next.id : null,
        },
      })
    )
  )

  const createIndividualPagePages = async ({ pages, gatsbyUtilities }) => 
  Promise.all(
      pages.map(( { page } ) =>
        // createPage is an action passed to createPages
        // See https://www.gatsbyjs.com/docs/actions#createPage for more info
        gatsbyUtilities.actions.createPage({
          // Use the WordPress uri as the Gatsby page path
          // This is a good idea so that internal links and menus work 👍
          path: (page.uri === "/" ? page.uri : page.languageCode + '/' + page.uri),

          // use the blog post template as the page component
          component: path.resolve('./src/templates/page.js'),

          // 'context' is available in the template as a prop and
          // as a variable in GraphQL.
          context: {
            // we need to add the post id here
            // so our blog post template knows which blog post
            // the current page is (when you open it in a browser)
            id: page.id,
          },
        })
      )
  )

  const createIndividualPeoplePages = async ({ people, gatsbyUtilities }) => 
  Promise.all(
      people.map(( { person } ) => 
        // createPage is an action passed to createPages
        // See https://www.gatsbyjs.com/docs/actions#createPage for more info
        gatsbyUtilities.actions.createPage({
          // Use the WordPress uri as the Gatsby page path
          // This is a good idea so that internal links and menus work 👍
          path: person.languageCode + '/' + person.uri,

          // use the person template as the page component
          component: path.resolve('./src/templates/person.js'),

          // 'context' is available in the template as a prop and
          // as a variable in GraphQL.
          context: {
            // we need to add the post id here
            // so our person template knows which person
            // the current person is (when you open it in a browser)
            id: person.id,
          },
        })
      )
  )


/**
 * This function creates all the individual blog pages in this site
 */
async function createBlogPostArchive({ posts, gatsbyUtilities }) {
  const graphqlResult = await gatsbyUtilities.graphql(/* GraphQL */ `
    {
      wp {
        readingSettings {
          postsPerPage
        }
      }
    }
  `)

  const { postsPerPage } = graphqlResult.data.wp.readingSettings

  const postsChunkedIntoArchivePages = chunk(posts, postsPerPage)
  const totalPages = postsChunkedIntoArchivePages.length

  return Promise.all(
    postsChunkedIntoArchivePages.map(async (_posts, index) => {
      const pageNumber = index + 1

      const getPagePath = page => {
        if (page > 0 && page <= totalPages) {
          // Since our homepage is our blog page
          // we want the first page to be "/" and any additional pages
          // to be numbered.
          // "/blog/2" for example
          return page === 1 ? '/' : '/blog/${page}'
        }

        return null
      }

      // createPage is an action passed to createPages
      // See https://www.gatsbyjs.com/docs/actions#createPage for more info
      await gatsbyUtilities.actions.createPage({
        path: getPagePath(pageNumber),

        // use the blog post archive template as the page component
        component: path.resolve('./src/templates/blog-post-archive.js'),

        // 'context' is available in the template as a prop and
        // as a variable in GraphQL.
        context: {
          // the index of our loop is the offset of which posts we want to display
          // so for page 1, 0 * 10 = 0 offset, for page 2, 1 * 10 = 10 posts offset,
          // etc
          offset: index * postsPerPage,

          // We need to tell the template how many posts to display too
          postsPerPage,

          nextPagePath: getPagePath(pageNumber + 1),
          previousPagePath: getPagePath(pageNumber - 1),
        },
      })
    })
  )
}

/**
 * This function queries Gatsby's GraphQL server and asks for
 * All WordPress blog posts. If there are any GraphQL error it throws an error
 * Otherwise it will return the posts 🙌
 *
 * We're passing in the utilities we got from createPages.
 * So see https://www.gatsbyjs.com/docs/node-apis/#createPages for more info!
 */
async function getPosts({ graphql, reporter }) {
  const graphqlResult = await graphql(/* GraphQL */ `
    query WpPosts {
      # Query all WordPress blog posts sorted by date
      allWpPost(sort: { fields: [date], order: DESC }) {
        edges {
          previous {
            id
          }

          # note: this is a GraphQL alias. It renames "node" to "post" for this query
          # We're doing this because this "node" is a post! It makes our code more readable further down the line.
          post: node {
            languageCode
            id
            uri
          }

          next {
            id
          }
        }
      }
    }
  `)

  if (graphqlResult.errors) {
    reporter.panicOnBuild(
      'There was an error loading your blog posts',
      graphqlResult.errors
    )
    return
  }

  return graphqlResult.data.allWpPost.edges
}

async function getPages({ graphql, reporter }) {
  const graphqlResult = await graphql(/* GraphQL */ `
    query WpPages {
      # Query all WordPress blog posts sorted by date
      allWpPage {
        edges {
          # note: this is a GraphQL alias. It renames "node" to "page" for this query
          # We're doing this because this "node" is a page! It makes our code more readable further down the line.
          page: node {
            languageCode
            id
            uri
          }
        }
      }
    }
  `)

  if (graphqlResult.errors) {
    reporter.panicOnBuild(
      'There was an error loading your pages',
      graphqlResult.errors
    )
    return
  }

  return graphqlResult.data.allWpPage.edges
}

async function getPeople({ graphql, reporter }) {
  const graphqlResult = await graphql(/* GraphQL */ `
    query WpPages {
      # Query all WordPress blog posts sorted by date
      allWpPerson {
        edges {
          # note: this is a GraphQL alias. It renames "node" to "person" for this query
          # We're doing this because this "node" is a person! It makes our code more readable further down the line.
          person: node {
            languageCode
            id
            uri
          }
        }
      }
    }
  `)

  if (graphqlResult.errors) {
    reporter.panicOnBuild(
      'There was an error loading your pages',
      graphqlResult.errors
    )
    return
  }

  return graphqlResult.data.allWpPerson.edges
}
