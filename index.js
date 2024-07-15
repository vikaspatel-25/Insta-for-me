// References to HTML elements
const profile1 = document.querySelector("#p1");
const profile2 = document.querySelector("#p2");
const profile3 = document.querySelector("#p3");
const profile4 = document.querySelector("#p4");
const active1 = document.querySelector("#b1");
const active2 = document.querySelector("#b2");
const active3 = document.querySelector("#b3");
const active4 = document.querySelector("#b4");
const profilepicture = document.querySelector("#pdataimg");
const profileName = document.querySelector("#pname");
const postcount = document.querySelector("#postcount");
const followercount = document.querySelector("#followercount");
const followingcount = document.querySelector("#followingcount");
const profiledata = document.querySelector("#profiledata");
const container = document.querySelector("#container");
const loading = document.querySelector("#loading");

// API URLs for profiledata
const urls = [
    'https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=pathsofstoicism&url_embed_safe=true',
    'https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=anushkasharma&url_embed_safe=true',
    'https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=virat.kohli&url_embed_safe=true',
    'https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=viratkohlistuffs&url_embed_safe=true'
];

// API URLs for posts
const postUrls = [
    'https://instagram-scraper-api2.p.rapidapi.com/v1.2/posts?username_or_id_or_url=pathsofstoicism&url_embed_safe=true',
    'https://instagram-scraper-api2.p.rapidapi.com/v1.2/posts?username_or_id_or_url=anushkasharma&url_embed_safe=true',
    'https://instagram-scraper-api2.p.rapidapi.com/v1.2/posts?username_or_id_or_url=virat.kohli&url_embed_safe=true',
    'https://instagram-scraper-api2.p.rapidapi.com/v1.2/posts?username_or_id_or_url=viratkohlistuffs&url_embed_safe=true'
];

// API options
const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': '6b80a3ba24msha85266f14d37935p187bdbjsn1ff23dc3fc73',
        'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
    }
};

// Function to convert follower count to million or thousand format
function convertToMillionOrThousand(followersCount) {
    if (followersCount >= 1000000) {
        return (followersCount / 1000000).toFixed(1) + 'M';
    } else if (followersCount >= 1000) {
        return (followersCount / 1000).toFixed(1) + 'k';
    } else {
        return followersCount.toString();
    }
}

//function to convert timestamp into date
function formatDateFromTimestamp(timestamp) {
    const milliseconds = timestamp * 1000;
    const dateObject = new Date(milliseconds);
    const day = dateObject.getDate().toString().padStart(2, '0');
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObject.getFullYear().toString().slice(-2);
    const dateString = `${day}-${month}-${year}`;
    return dateString;
}

// Fetch profile data for each URL
let profileData = {};
async function fetchProfileData(urlNumber) {
    try {
        const url = urls[urlNumber];
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
        }
        const urldata = await response.json();
        
        const profileInfo = {
            name: urldata.data.full_name,
            followers: convertToMillionOrThousand(urldata.data.follower_count),
            following: urldata.data.following_count,
            posts: urldata.data.media_count,
            profilepic: urldata.data.profile_pic_url_hd
        };
        profileData[urlNumber] = profileInfo;
    } catch (error) {
        console.error(`Error fetching data from ${urls[urlNumber]}:`, error);
    }
}

// Update profile data on the webpage
function updateProfileData(profileNumber) {
    const eventNumber = profileNumber;
    const data = profileData[profileNumber];
    if (data) {
        profileName.innerHTML = data.name;
        followercount.innerText = data.followers;
        followingcount.innerText = data.following;
        profilepicture.src = data.profilepic;
        profilepicture.setAttribute('onerror', `corsHandler(event,${eventNumber})`); 
        postcount.innerText = data.posts;
    } else {
        throw new Error(`Profile data not available for profile number ${profileNumber}`);
    }
}

//fetch post data 
let postsDataArray = {};
async function fetchPostData(postUrlNum) {
    try {
        const url = postUrls[postUrlNum];
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
        }
        const rawData = await response.json();
        console.log(rawData);
        const count = rawData.data.count;
        let postNumber = -1;
        let postDataHolder = [];

        for (let i = 0; i < count; i++) {
            let is_video = rawData.data.items[i].is_video;
            let is_paid_partnership = rawData.data.items[i].is_paid_partnership;
            if (is_video == false && is_paid_partnership == false) {
                postNumber++;
                const postData = {
                    username: rawData.data.items[i].caption.user.username,
                    likes: convertToMillionOrThousand(rawData.data.items[i].like_count),
                    date: formatDateFromTimestamp(rawData.data.items[i].taken_at),
                    caption: rawData.data.items[i].caption.text,
                    image: rawData.data.items[i].image_versions.items[0].url,
                    imgHeight: rawData.data.items[i].image_versions.items[0].height,
                    imgWidth: rawData.data.items[i].image_versions.items[0].width
                };
                postDataHolder[postNumber] = postData;
            }
        }
        postsDataArray[postUrlNum] = postDataHolder;
    } catch (error) {
        console.error(`Error fetching data from ${postUrls[postUrlNum]}:`, error);
    }
}

// Function to create post containers and populate them with post data
function createPostContainers(profileNumber) {
    const posts = postsDataArray[profileNumber];
    const profileInfo = profileData[profileNumber];
    const postSection = document.querySelector(".postcontainer");
    const eventNumber = profileNumber;

    // Clear post section before appending new post containers
    postSection.innerHTML = '';

    posts.forEach(post => {
        const postContent = document.createElement('div');
        postContent.classList.add('postcontainer');
        postContent.innerHTML = `
            <div class="postinfo">
                <div class="postinfo1"><img src="${profileInfo.profilepic}" class="infoimage" onerror = "corsHandler(event,${eventNumber})"><span class="infoname">${post.username}</span></div>
                <div class="postinfo1"><span class="metriclabeldata" style="margin-right:10px">${post.date}</span></div>
            </div>
            <div style="width: 100%; min-height: 220px;background-color: black;display: flex;align-items: center;justify-content:center"><img src="${post.image}" style="width: 100%; overflow:hidden;"></div>
            <div class="postmetrics">
                <div class="metricsdiv"><img src="images/like.svg" class="likebutton"><span class="likes">${post.likes}</span></div>
            </div>
            <div class="captioncontainer"><span class="caption">Caption :   ${post.caption}</span></div>
        `;
        postSection.appendChild(postContent);
    });
}

function corsHandler(event,eventNumber){
    let = picRequested = event.target;
    if(eventNumber == 0){
        picRequested.src = `images/pathofstoicism.jpg`;
    }
    else if(eventNumber == 1){
        picRequested.src = `images/anushkasharma.jpg`;
    }
    else if(eventNumber == 2){
        picRequested.src = `images/viratkohli.jpg`;
    }
    else if(eventNumber == 3){
        picRequested.src = `images/viratkohlistuffs.jpg`;
    }
    
};

// Events for profile buttons
profile1.addEventListener('click', function () {
    // Display loading indicator
    container.style.display = "none";
    loading.style.display = "flex";

    // Function to handle updating UI when both profile and post data are fetched
    function updateUI() {
        // Hide loading indicator and display container
        loading.style.display = "none";
        container.style.display = "flex";
        // Update profile data
        updateProfileData(0);
        // Create post containers for the initial profile
        createPostContainers(0);
    }

    // Check if profile data is fetched
    if (!profileData[0]) {
        fetchProfileData(0)
        .then(() => {
            // Check if post data is also fetched
            if (!postsDataArray[0]) {
                fetchPostData(0)
                .then(() => {
                    // Both profile and post data are fetched, update UI
                    updateUI();
                })
                .catch(error => {
                    console.error('Error fetching post data:', error);
                    // Hide loading indicator in case of error
                  
                });
            } else {
                // Post data is already fetched, update UI
                updateUI();
            }
        })
        .catch(error => {
            console.error('Error fetching profile data:', error);
            // Hide loading indicator in case of error
          
        });
    } else {
        // Profile data is already fetched, check if post data is fetched
        if (!postsDataArray[0]) {
            fetchPostData(0)
            .then(() => {
                // Post data is fetched, update UI
                updateUI();
            })
            .catch(error => {
                console.error('Error fetching post data:', error);
                // Hide loading indicator in case of error
           
            });
        } else {
            // Both profile and post data are already fetched, update UI
            updateUI();
        }
    }

    // Updating active tab UI
    active1.classList.add('active');
    active2.classList.remove('active');
    active3.classList.remove('active');
    active4.classList.remove('active');
});

profile2.addEventListener('click', function () {
    // Display loading indicator
    container.style.display = "none";
    loading.style.display = "flex";

    // Function to handle updating UI when both profile and post data are fetched
    function updateUI() {
        // // Hide loading indicator and display container
        loading.style.display = "none";
        container.style.display = "flex";
        // Update profile data
        updateProfileData(1);
        // Create post containers for the initial profile
        createPostContainers(1);
    }

    // Check if profile data is fetched
    if (!profileData[1]) {
        fetchProfileData(1)
        .then(() => {
            // Check if post data is also fetched
            if (!postsDataArray[1]) {
                fetchPostData(1)
                .then(() => {
                    // Both profile and post data are fetched, update UI
                    updateUI();
                })
                .catch(error => {
                    console.error('Error fetching post data:', error);
                    // Hide loading indicator in case of error
                  
                });
            } else {
                // Post data is already fetched, update UI
                updateUI();
            }
        })
        .catch(error => {
            console.error('Error fetching profile data:', error);
            // Hide loading indicator in case of error

        });
    } else {
        // Profile data is already fetched, check if post data is fetched
        if (!postsDataArray[1]) {
            fetchPostData(1)
            .then(() => {
                // Post data is fetched, update UI
                updateUI();
            })
            .catch(error => {
                console.error('Error fetching post data:', error);
                // Hide loading indicator in case of error
              
            });
        } else {
            // Both profile and post data are already fetched, update UI
            updateUI();
        }
    }

    // Updating active tab UI
    active1.classList.remove('active');
    active2.classList.add('active');
    active3.classList.remove('active');
    active4.classList.remove('active');
});

profile3.addEventListener('click', function () {
    // Display loading indicator
    container.style.display = "none";
    loading.style.display = "flex";

    // Function to handle updating UI when both profile and post data are fetched
    function updateUI() {
        // // Hide loading indicator and display container
         loading.style.display = "none";
         container.style.display = "flex";
        // Update profile data
        updateProfileData(2);
        // Create post containers for the initial profile
        createPostContainers(2);
    }

    // Check if profile data is fetched
    if (!profileData[2]) {
        fetchProfileData(2)
        .then(() => {
            // Check if post data is also fetched
            if (!postsDataArray[2]) {
                fetchPostData(2)
                .then(() => {
                    // Both profile and post data are fetched, update UI
                    updateUI();
                })
                .catch(error => {
                    console.error('Error fetching post data:', error);
                    // Hide loading indicator in case of error
                    
                });
            } else {
                // Post data is already fetched, update UI
                updateUI();
            }
        })
        .catch(error => {
            console.error('Error fetching profile data:', error);
            // Hide loading indicator in case of error
            
        });
    } else {
        // Profile data is already fetched, check if post data is fetched
        if (!postsDataArray[2]) {
            fetchPostData(2)
            .then(() => {
                // Post data is fetched, update UI
                updateUI();
            })
            .catch(error => {
                console.error('Error fetching post data:', error);
                // Hide loading indicator in case of error
              
            });
        } else {
            // Both profile and post data are already fetched, update UI
            updateUI();
        }
    }

    // Updating active tab UI
    active1.classList.remove('active');
    active2.classList.remove('active');
    active3.classList.add('active');
    active4.classList.remove('active');
});

profile4.addEventListener('click', function () {
    // Display loading indicator
    container.style.display = "none";
    loading.style.display = "flex";

    // Function to handle updating UI when both profile and post data are fetched
    function updateUI() {
        // Hide loading indicator and display container
         loading.style.display = "none";
         container.style.display = "flex";
        // Update profile data
         updateProfileData(3);
        // Create post containers for the initial profile
        createPostContainers(3);
    }

    // Check if profile data is fetched
    if (!profileData[3]) {
        fetchProfileData(3)
        .then(() => {
            // Check if post data is also fetched
            if (!postsDataArray[3]) {
                fetchPostData(3)
                .then(() => {
                    // Both profile and post data are fetched, update UI
                    updateUI();
                })
                .catch(error => {
                    console.error('Error fetching post data:', error);
                    // Hide loading indicator in case of error
                  
                });
            } else {
                // Post data is already fetched, update UI
                updateUI();
            }
        })
        .catch(error => {
            console.error('Error fetching profile data:', error);
            // Hide loading indicator in case of error
           
        });
    } else {
        // Profile data is already fetched, check if post data is fetched
        if (!postsDataArray[3]) {
            fetchPostData(3)
            .then(() => {
                // Post data is fetched, update UI
                updateUI();
            })
            .catch(error => {
                console.error('Error fetching post data:', error);
                // Hide loading indicator in case of error
               
            });
        } else {
            // Both profile and post data are already fetched, update UI
            updateUI();
        }
    }

    // Updating active tab UI
    active1.classList.remove('active');
    active2.classList.remove('active');
    active3.classList.remove('active');
    active4.classList.add('active');
});

// Fetch posts for initial page
// Fetch profile data and update webpage for initial
fetchProfileData(3)
    .then(() => {
        updateProfileData(3); // Update initially shown profile data
        fetchPostData(3)
        .then(() => {
            container.style.display = "flex";
            loading.style.display = "none";
            createPostContainers(3); // Create post containers for the initial profile
        })
        .catch(error => {
            console.error('Error fetching post data:', error);
        });
    })
    .catch(error => {
        console.error('Error fetching profile data:', error);
    });
