import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
//import info from '~/backend/database.json' assert { type: 'json' };

//import json from '../../backend/database.json';
//import {
//    authed
//}from '../../backend/src/server.js'

var authToken = null;
var userId = null;


const loginCard=document.getElementById('loginCard');


const registerCard=document.getElementById('registerCard');


const loggedIn = document.getElementById('loggedIn');
const popUp = document.getElementById('popUp');

const feed=document.getElementById('feed');
const profile=document.getElementById('profile')

const uploadJob=document.getElementById('uploadJob')
const editJob = document.getElementById('editJob')
const closePopUp = document.getElementById("closePopUp");
const authPage = document.getElementById("authPage");
var feedPosition = 0;
var loading = false;

var jobsOnScreen = []

var jobsToLoad = 1;

function processFetch(method, data, url, callback) {
    let requestOpt = {
        method: method,
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
        },
    }
    fetch(`http://localhost:${BACKEND_PORT}/${url}`, requestOpt)
        .then( response=>response.json())
        .then(body=>{
            if(body.error){
                alert(body.error)
            }else {                
                callback(body)
            } 
        })
}

function changeDisplay(toDisplay) {
    let pages=[authPage, profile, feed, uploadJob, editJob]
    for (var page in pages){
        if (pages[page] === toDisplay){
            toDisplay.style.dispaly = "Block";
        }
        else {
            pages[page].style.dispaly = "None";
        }
    }

    /**
    authPage.style.display="None";
    profile.style.display = "None";
    feed.style.display="None";
    uploadJob.style.display="None"
    editJob.style.display="None"

    toDisplay.style.dispaly = "Block"
    */
}

function idToName(field, id) {

    let request = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
        },
    }
    fetch(`http://localhost:${BACKEND_PORT}/user?userId=${id}`, request)
        .then(response=>response.json())
        .then(body => {
            if(body.error){
                alert(body.error)
            }else {
                field.textContent= body.name
            }
        })
    
}


/***********************AUTH FUNCTIONS***********************/

const login = (email, password) => {
    let data = {"email": email, "password": password};
    processFetch('POST', data, 'auth/login', (body)=>{
        authToken = body.token;
        userId = body.userId;
        //loadFeed(0)
        loggedIn.style.display="Block";
        //changeDisplay(feed)
        
        authPage.style.display="None";
        loggedIn.style.display="Block";
        profile.style.display = "None";
        feed.style.display="Block";
        uploadJob.style.display="None"
        editJob.style.display="None"

        loadFeed()
        /**
        //I've implemented polling for live update, and it sort of works. But it is REALLY SLOW
        //Something's probably wrong with it but i can't fix it
        poll(()=>{
            let request = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken
                }
            }
        
            let timesToRequest = parseInt(jobsOnScreen.length/5) + 1
            for (let j = 0; j < timesToRequest; j++){
                fetch(`http://localhost:${BACKEND_PORT}/job/feed?start=${j*5}`, request)
                .then(response=>response.json())
                .then(body => {
                    if(body.error){
                        alert(body.error)
                    }else {
                        for (let i = 0; i < 5 && i < jobsOnScreen.length-5*j; i++ ) {
                    
                            if (body[i].likes.length !== jobsOnScreen[5*j + i].likes.length) {
                                
                                jobsOnScreen[5*j + i].likes = body[i].likes
                                jobsOnScreen[5*j + i].likesCountDisplay.textContent = `Likes:${body[i].likes.length}`
                                console.log("CHANGIN")
                            }
                            if (body[i].comments.length !== jobsOnScreen[5*j + i].comments.length) {
                                
                                jobsOnScreen[5*j + i].comments = body[i].comments
                                jobsOnScreen[5*j + i].commentsCountDisplay.textContent = `Comments:${body[i].comments.length}`
                                console.log("CHANGIN")
                            }
                        }
                    }
                })
            }

            
        }, 1000)
        */
   
    })
}

document.getElementById('loginBtn').addEventListener('click', () => {
    login(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value)
} );

const register = (email, password, name) => {
    var data = {"email": email, "password": password, "name":name};
    processFetch('POST', data, 'auth/register', (body)=>{
        authToken = body.token;
        userId = body.userId
        registerCard.style.display="None"
        loginCard.style.display="Block"
    })   
}

document.getElementById('submitBtn').addEventListener('click', () => {
    const registerPassword = document.getElementById('registerPassword')
    const registerPasswordConfirm = document.getElementById('registerPasswordConfirm')
    if (registerPassword.value !== registerPasswordConfirm.value) {
        alert("The passwords do not match. Please try again.")
    }
    else {
        register(document.getElementById('registerEmail').value, registerPassword.value, document.getElementById('registerName').value);
    }

})

document.getElementById('createNewAccontBtn').addEventListener('click', () => {
    loginCard.style.display='None'
    registerCard.style.display='Block'
});

/***********************FEED FUNCTIONS***********************/


window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && feed.style.display === 'block' 
    && loading === false ) {
        /**
        

        feedPosition += 2
        */
       console.log('buttom!')
       loadFeed()
       
    }
};

document.getElementById('feedButton').addEventListener('click', ()=> {
    //changeDisplay(feed)
    
    authPage.style.display="None";
    loggedIn.style.display="Block";
    profile.style.display = "None";
    feed.style.display="Block";
    uploadJob.style.display="None"
    editJob.style.display="None"
    
} )

function loadFeed () {
    loading = true
    loggedIn.style.display="Block";
    //changeDisplay(feed)
    
    authPage.style.display="None";
    loggedIn.style.display="Block";
    profile.style.display = "None";
    feed.style.display="Block";
    uploadJob.style.display="None"
    editJob.style.display="None"
    /**
    processFetch('GET', null, 'job/feed?start=0' , ()=>{
        for (let i = 0; i < body.length; i++) {
            loadEachJob(i, body);
        }
    })
    */
    let request = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
        },
    }

    
    fetch(`http://localhost:${BACKEND_PORT}/job/feed?start=${feedPosition}`, request)
        .then(response=>response.json())
        .then(body => {
            
            if(body.error){
                alert(body.error)
            }else {

                for (let i = 0; i < body.length ; i++ ) {
                    const jobPromise = new Promise( (resolve, reject) => {
                        let likesAndComments = loadEachJob(i, body);
                        let likesCountDisplay = likesAndComments[0]
                        let commmentsCountDisplay = likesAndComments[1]

                        let job = body[i]
                        
                        job["commentsCountDisplay"] = commmentsCountDisplay
                        job["likesCountDisplay"] = likesCountDisplay

                        jobsOnScreen.push(job)
                        resolve ()
                    })

                    jobPromise
                        .then ( () => { 
                            loading = false
                            feedPosition += 1
                        })
                        
                }
            } 
        })
    
}

const loadEachJob = (i, body)=>{
    var newDiv = document.createElement('div');
    newDiv.id = 'job';
    newDiv.className = 'card rounded-3 text-black card-body justify-content-left text-left';
    newDiv.style.marginBottom="30px"
    newDiv.style.width = "80%";
    newDiv.style.maxWidth = "800px";
    newDiv.style.marginLeft = "auto";
    newDiv.style.marginRight = "auto";

    var title = document.createElement('div');
    title.className='h1 text-center'
    title.textContent = body[i].title
    newDiv.appendChild(title)
    
    var img = document.createElement('img');
    img.src = body[i].image;
    img.style.marginLeft = "auto"; 
    img.style.marginRight="auto";
    img.style.width="50%";
    newDiv.appendChild(img)

    var jobCreator = document.createElement('div');
    jobCreator.textContent="Posted by: " + body[i].creatorId 
    
    //addLinkToUser(jobCreator, body[i].creatorId)
    jobCreator.addEventListener('click', () => {loadUserProfile(body[i].creatorId)} )
    idToName(jobCreator, body[i].creatorId)

    newDiv.appendChild(jobCreator)

    var datePosted = Date.parse(body[i].createdAt)
    var curDate = new Date()
    var differenceInMS = curDate-datePosted

    var timeSinceInfo = ""
    if (differenceInMS <= 24*60*60*1000){
        var minutes = differenceInMS/1000/60
        timeSinceInfo = Math.floor(minutes/60).toString() + " hours and " + Math.floor( (minutes%60) ).toString() + " minutes ago"
    }
    else {
        timeSinceInfo = reformatDate (body[i].createdAt)
    }
    var jobPosted = document.createElement('div');
    jobPosted.textContent="Job Posted: " + timeSinceInfo
    newDiv.appendChild(jobPosted)

    var jobStartingDate = document.createElement('div');
    jobStartingDate.textContent="Starting date: " + reformatDate (body[i].start)
    newDiv.appendChild(jobStartingDate)

    var jobDescription = document.createElement('div');
    jobDescription.textContent="Detail: " + body[i].description
    newDiv.appendChild(jobDescription)

    var likeCount = document.createElement('a');
    likeCount.addEventListener('click', ()=>{        
        if (window.getComputedStyle(popUp).display === "none"){
            displayPopup(body[i], 'Like')
        }
    })
    likeCount.className="likeLinks"
    likeCount.id=`like${i}`
    likeCount.textContent="Likes: " + body[i].likes.length
    newDiv.appendChild(likeCount)

    var commentsCount = document.createElement('a');
    commentsCount.addEventListener('click', ()=>{
        const popUp = document.getElementById('popUp')
        if (window.getComputedStyle(popUp).display === "none"){
            displayPopup(body[i], 'Comment')
        }
        
    })
    commentsCount.className="commentLinks"
    //commentsCount.id=`like${i}`
    commentsCount.textContent="Comments: " + body[i].comments.length
    newDiv.appendChild(commentsCount)

    var likeButton = document.createElement('button');
    likeButton.classList = "btn btn-primary"
    newDiv.appendChild(likeButton)

    var likedPost = false;
    for (var j = 0; j < body[i].likes.length; j++){
        if (body[i].likes[j].userId === userId) {
            likedPost = true;
        }
    }
    if (likedPost === true){
        likeButton.textContent="Liked (click again to unlike)"
    }
    else {
        likeButton.textContent="Like"
    }

    likeButton.addEventListener('click', () => {
        if (likedPost === false){
            processLikeOrDislike(likeButton, body[i].id, true)
            likedPost = true

        }
        else {
            processLikeOrDislike(likeButton, body[i].id, false)
            likedPost = false
        }
        
    })

    let commentBox = document.createElement('div')
    commentBox.classList="input-group mb-3"

    let commentText = document.createElement('input')
    commentText.classList="form-control"

    let commentButton = document.createElement('button')
    commentButton.classList="btn btn-primary"
    commentButton.textContent="Comment"

    commentBox.appendChild(commentText)
    commentBox.appendChild(commentButton)

    commentButton.addEventListener('click', ()=>{
        let data = {
            'id': body[i].id,
            'comment': commentText.value
        }
        processFetch('POST', data, 'job/comment' , ()=>{
            commentText.value= null
        })
    })

  
    newDiv.appendChild(commentBox)

    if (body[i].creatorId === userId){
        let editJobButton = document.createElement('button');
        editJobButton.classList = "btn btn-primary"
        editJobButton.setAttribute('id', `job${body[i].id}`)
        editJobButton.textContent="Edit this Job"
        newDiv.appendChild(editJobButton)
        
        editJobButton.addEventListener('click', ()=>{
            feed.style.display = "None"
            document.getElementById('editJob').style.display="Block"
            document.getElementById('editJobTitle').value = body[i].title
            document.getElementById('editJobStartDate').value = body[i].start
            document.getElementById('editJobDescription').value = body[i].description
            document.getElementById('editJobId').textContent=body[i].id
        })
        
    
    }
    
    feed.appendChild(newDiv)
    return [likeCount, commentsCount]
}

function reformatDate (date) {
    let dateSplit = date.split('T')[0]
    let p = dateSplit.split('-')
    let reformatedDate = [p[2],p[1],p[0] ].join("/")
    return (reformatedDate)
}


/***********************POST JOBS***********************/
document.getElementById("uploadJobButton").addEventListener(('click'), ()=>{
    //changeDisplay(uploadJob)
    
    authPage.style.display="None";
    loggedIn.style.display="Block";
    profile.style.display = "None";
    feed.style.display="None";
    uploadJob.style.display="Block"
    
})

document.getElementById('submitNewJob').addEventListener(('click'), ()=>{
    let file = document.getElementById('newJobPic').files[0] ;

    if (file !== undefined){
        let reader = new FileReader();
    
        reader.onloadend = ()=> {postJob(reader.result)}
        reader.readAsDataURL(file);
    }
    else {
        postJob(null)
    }
})

function postJob(img){
    var data = {"title": document.getElementById('newJobTitle').value, 
                "image": img,
                "start": document.getElementById('newJobStartDate').value, 
                "description": document.getElementById('newJobDescription').value,
            }  
    processFetch('POST', data, 'job' , ()=>{})
    
    document.getElementById('newJobTitle').value=""
    document.getElementById('newJobStartDate').value=""
    document.getElementById('newJobDescription').value=""
    document.getElementById('newJobPic').value=""
    alert("Successful Upload!")

}


/***********************JOB INTERACTIONS***********************/
document.getElementById('deleteJob').addEventListener('click', ()=>{
    let data={
        "id": document.getElementById('editJobId').textContent
    }
    processFetch('DELETE', data, 'job' , ()=>{
        alert('Successfully Deleted!')
    })
})


function processLikeOrDislike(likeButton, postID, toLike){
    if (toLike){
        likeButton.textContent="Liked(click to unlike)"
    }
    else {
        likeButton.textContent="Like"
    }
    
    var data = {"id": postID, "turnon": toLike};
    processFetch('PUT', data, 'job/like' , ()=>{
        //alert('LIKED!')
    })
}

document.getElementById('submitJobEdit').addEventListener('click', ()=>{
    let file = document.getElementById('editJobPic').files[0] ;

    if (file !== undefined){
        let reader = new FileReader();
    
        reader.onloadend = ()=> {submitJobEdit(reader.result)}
        reader.readAsDataURL(file);
    }
    else {
        submitJobEdit(null)
    }
})

function submitJobEdit(img){
    let data={
        "id": document.getElementById('editJobId').textContent,
        "title": document.getElementById('editJobTitle').value,
        "image": img,
        "start":document.getElementById('editJobStartDate').value,
        "description":  document.getElementById('editJobDescription').value

    }

    processFetch('PUT', data, 'job' , ()=>{
        
        alert('Successfully Edited!')
    })
}




 
//a polling function to see if there are any updates
/**
const poll = (fn, interval) => {
    console.log('Start poll...');
 
    const executePoll = async (resolve, reject) => {
      console.log('- poll');
      if (fn != undefined){
        const result = await fn();
        setTimeout(executePoll, interval, resolve, reject);
      }
      else {
        print("BANANA")
      } 
      
    };
  
    return new Promise(executePoll);
  };
*/




/***********************POPUP PAGE FUNCTIONS***********************/
closePopUp.addEventListener("click", () => {
    let parent = document.getElementById('engagedUsers')
    while (parent.firstChild) {
        parent.firstChild.remove()
    }
    document.getElementById('popUp').style.display = 'None'
})

function displayPopup (data, interaction) {
    popUp.style.display="Block"
    var popUpText = document.getElementById('popUpText')
    popUpText.textContent=`${interaction}:`

    if (interaction === "Like")  {
        var num = data.likes.length
    }
    else {
        var num = data.comments.length
    }
    
    for (var j = 0; j < num; j++){
        if (interaction === 'Like'){
            loadLinkToProfiles(data.likes[j], interaction)
        }
        else if (interaction === 'Comment'){
            loadLinkToProfiles(data.comments[j], interaction)
        }
    }
}


/***********************PROFILE FUNCTIONS***********************/
document.getElementById('ownProfileButton').addEventListener('click', ()=> {
    loadUserProfile(userId)} )

function loadLinkToProfiles(userInfo, interaction) {
    //load DOM element first
    const myPromise = new Promise((resolve, reject) => {
        var listItem = document.createElement('li');  
   
        var clickedUserId = null
        if (interaction === "Like"){
            listItem.textContent = userInfo.userName
            //listItem.className = `userId=${body[jobNumber].likes[j].userId}`;
            clickedUserId = userInfo.userId
        }
        else {
            listItem.textContent = userInfo.userName + ": " + userInfo.comment
            //listItem.className = `userId=${body[jobNumber].comments[j].userId}`;
            clickedUserId = userInfo.userId
        }

        document.getElementById('engagedUsers').appendChild(listItem)

        resolve([listItem, clickedUserId])
    });

    //then add link to the display text
    myPromise
        .then( (listAndLink)=> {
            var listItem = listAndLink[0];
            var clickedUserId = listAndLink[1];
            //addLinkToUser(listItem, clickedUserId)   
            listItem.addEventListener('click', ()=>{
                let parent = document.getElementById('engagedUsers')
                while (parent.firstChild) {
                    parent.firstChild.remove()
                }
                document.getElementById('popUp').style.display = 'None'

                loadUserProfile(clickedUserId)
            })
            
            //listItem.addEventListener('click', ()=>loadUserProfile(clickedUserId) )
        }) 
}

function loadUserProfile(id) {

    //changeDisplay(profile)
    
    feed.style.display = 'None'
    popUp.style.display = 'None'
    profile.style.display = 'Block'
    editJob.style.display="None"
    uploadJob.style.display="None"
    
    document.getElementById('profileInfo').style.display="Block"   
    document.getElementById('profileEdit').style.display="None"

    let request = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken
        },
    }
    fetch(`http://localhost:${BACKEND_PORT}/user?userId=${id}`, request)
        .then(response=>response.json())
        .then(body => {
            if(body.error){
                alert(body.error)
            }else {
                document.getElementById('profilePic').src = body.image;
                document.getElementById('profileName').textContent=`User name: ${body.name}`;
                document.getElementById('profileEmail').textContent=`User email: ${body.email}`;
                document.getElementById('profileId').textContent=`User id: ${body.id}`;

                //clear children under jobs
                var parent = document.getElementById('profileJobsListed')
                while (parent.firstChild) {
                    parent.firstChild.remove()
                }

                for (var jobCount = 0; jobCount < body.jobs.length; jobCount++){
                    var jobTitle = document.createElement('li'); 
                    jobTitle.textContent = body.jobs[jobCount].title
                    document.getElementById('profileJobsListed').appendChild(jobTitle)
                }

                //clear children under watchess list
                var parent = document.getElementById('profileWatchees')
                while (parent.firstChild) {
                    parent.firstChild.remove()
                }


                document.getElementById('profileWatchedByLink').textContent = `Watched By ${body.watcheeUserIds.length} Users:`
                //load all watchees + link
                for (var watcheesCount = 0; watcheesCount < body.watcheeUserIds.length; watcheesCount++){
                    const myPromise = new Promise((resolve, reject) => {
                        var watchee = document.createElement('li'); 
                        //watchee.textContent = body.watcheeUserIds[watcheesCount]
                        document.getElementById('profileWatchees').appendChild(watchee)
                        //addLinkToUser(watchee, body.watcheeUserIds[watcheesCount])
                        var id = body.watcheeUserIds[watcheesCount]
                        watchee.addEventListener('click', ()=>{ loadUserProfile(id)}  )
                        idToName(watchee, body.watcheeUserIds[watcheesCount])

                        
                
                        resolve([watchee, body.watcheeUserIds[watcheesCount] ])
                    });
                
                    //then add link to the display text
                    myPromise
                        .then( (listAndLink)=> {
                            var listItem = listAndLink[0];
                            var clickedUserId = listAndLink[1];
                            //addLinkToUser(listItem, clickedUserId)   
                            listItem.addEventListener('click', ()=>{loadUserProfile(clickedUserId)} )
                            
                            //listItem.addEventListener('click', ()=>loadUserProfile(clickedUserId) )
                        }) 

                }

                //load edit button if own profile:
                if (body.id === userId) {
                    document.getElementById('editProfileButton').style.display='Block'
                }
                else {
                    document.getElementById('editProfileButton').style.display='None'
                }

                //load watch button
                if (body.watcheeUserIds.includes(userId)){
                    document.getElementById('watchButton').textContent = 'Unwatch'
                }
                else{
                    document.getElementById('watchButton').textContent = 'Watch'
                }

                document.getElementById('watchButton').addEventListener (('click'), ()=>{
                    watchOrUnwatch(body.email, body.watcheeUserIds.includes(userId) )
                })
            } 
            
        })
}


document.getElementById('editProfileButton').addEventListener( ('click'), ()=>{
    if (document.getElementById('profileInfo').style.display === "block") {
        document.getElementById('profileInfo').style.display="None"    
        document.getElementById('profileEdit').style.display="Block"

        document.getElementById('editProfileButton').textContent = "Submit Changes"
    }
    else {
        let file = document.getElementById('updatePic').files[0] ;

        if (file !== undefined){
            let reader = new FileReader();
     
            reader.onloadend = ()=> {updateProfile(reader.result)}
            reader.readAsDataURL(file);
        }
        else {
            updateProfile(null)
        }
        document.getElementById('editProfileButton').textContent = "Edit Profile"
        
    }
})

function updateProfile (img) {
    var data = {"email": document.getElementById('updateEmail').value, 
                "password": document.getElementById('updatePassword').value, 
                "name":document.getElementById('updateName').value, 
                "image": img};
    
    processFetch('PUT', data, 'user' , ()=>{
        document.getElementById('profileInfo').style.display="Block"    
        document.getElementById('profileEdit').style.display="None"
        loadUserProfile(userId)
    })


}

document.getElementById('searchForUserBtn').addEventListener(('click'), ()=>{
    
    watchOrUnwatch(document.getElementById('searchForUser').value, false)
    document.getElementById('searchForUser').value=""
})

function watchOrUnwatch(email, alreadyWatching) {
    let data = {
        "email":email,
        "turnon": !alreadyWatching
    }
    
    processFetch('PUT', data, 'user/watch' , ()=>{
        if(!alreadyWatching){
            alert("Watch Success")
            document.getElementById('watchButton').textContent = 'Unwatch'
        }
        else{
            document.getElementById('watchButton').textContent = 'Watch'
        }
        
    })
}
