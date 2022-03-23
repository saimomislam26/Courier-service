export const setFeeds = async(data) => {
    console.log(data);
    const res = await fetch(`${process.env.REACT_APP_HOST_NAME}historyApi/saveHistory`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            ...data
        })
    })
    const temp = await res.json()
    console.log(temp);
}

export const PAGINATION_LIMIT = 10

// const feedsData = {
//     user: authenticateUser._id,
//     message: `A parcel created by ${authenticateUser.Username} with parcel id ${temp.SearchId}`,
//     branch: authenticateUser.branch.branch,
//     tag: "parcel"
//   }
//   setFeeds(feedsData)