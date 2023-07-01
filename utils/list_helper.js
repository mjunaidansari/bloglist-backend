const dummy = (blogs) => {
    return 1
}

const totalLikes = blogs => {
    const reducer = (sum, blog) => {
        return sum + blog.likes
    }
    return blogs.reduce(reducer, 0)
}

const favBlog = blogs => {
    const maxLikes = Math.max(...blogs.map(blog => blog.likes))
    console.log(maxLikes)
    const blog = blogs.find(blog => blog.likes === maxLikes)
    console.log(blog)
    return {
        title: blog.title,
        author: blog.author,
        likes: blog.likes
    }
}

const mostBlogs = blogs => {

    let mBlogs = []

    // iterating through all the blogs
    blogs.forEach(blog => {
        // checking whether its in mBlogs array
        const found = mBlogs.some(mblog => mblog.author === blog.author)
        if(!found) {
            // if not then pushing it to the array
            mBlogs.push({
                author: blog.author,
                blogs: 1
            })
        } 
        else {
            // if present then incrementing the number of blogs
            mBlogs.forEach(mblog => {
                if(mblog.author === blog.author){
                    mblog.blogs += 1
                }
            })
        }
    })

    // finding the object with max blogs
    const maxBlogs = Math.max(...mBlogs.map(blog => blog.blogs))
    const authorWithMostBlogs = mBlogs.find(blog => blog.blogs === maxBlogs)

    return authorWithMostBlogs
}

module.exports = {
    dummy,
    totalLikes,
    favBlog,
    mostBlogs
}