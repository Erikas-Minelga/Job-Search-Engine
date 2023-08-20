const mainPage = document.querySelector(".page");
const pageLoader = document.querySelector(".page-loader");
const searchBar = document.querySelector("input");
const searchTermsElement = document.querySelector("ul");
const searchResults = document.querySelector(".search-results");
const countrySelect = document.querySelector("#country");
const checkBoxes = document.querySelectorAll("input");
const salaryDropDowns = document.querySelectorAll("select:not(#country)");
const resultsSpinner = document.querySelector(".search-spinner");
const errorElements = document.querySelectorAll(".error");

let pageNumber = localStorage.getItem("page") ? localStorage.getItem("page") : 1;
let country = localStorage.getItem("country");
let atBottom = false;

if(country === null)
{
    pageLoader.classList.remove("hidden");
    mainPage.classList.add("hidden");
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=KEY`;    //Key omitted due to it being sensitive data
    
        getCountry(url).then(response => {
            country = response;
            localStorage.setItem('country', country);
            pageLoader.classList.add("hidden");
            mainPage.classList.remove("hidden");
            document.querySelectorAll(".header > div").forEach(elem => {elem.style.animation = "fade-in ease 3s"});
            document.querySelector(".header > div:nth-child(2)").classList.remove("hidden");
            document.querySelector(".header > div:nth-child(1) > h2").classList.remove("hidden");
        });
    });
}

let jobData = [];   //Store job data for filtering and local storage
let searchTags = [];
let filterOptions = JSON.parse(localStorage.getItem("filter_options"));
if(!filterOptions)
{
    filterOptions = {
        "remote": false,
        "fulltime": false,
        "minSalary": 0,
        "maxSalary": Number.MAX_VALUE,
        "noCompetitive": false
    };

    localStorage.setItem("filter_options", JSON.stringify(filterOptions));
} 

const storedJobData = localStorage.getItem("job_data");
const storedSearchTags = JSON.parse(localStorage.getItem("search-tags"));

if(storedJobData)
{
    jobData = JSON.parse(storedJobData);
    displayResults();
}

if(storedSearchTags)
    storedSearchTags.forEach(tag => {addSearchTag(tag)});
    

function filterData()
{
    return jobData.filter(job => {
        if(((filterOptions["remote"] && job.location === "Remote") || !filterOptions["remote"]) && 
        ((filterOptions["fulltime"] && job.contract === "Fulltime") || !filterOptions["fulltime"]) && 
        (job.displayedSalary >= filterOptions["minSalary"] && job.displayedSalary <= filterOptions["maxSalary"]) &&
        ((filterOptions["noCompetitive"] && job.displayedSalary !== 0) || !filterOptions["noCompetitive"]))
             return true;
               
        return false;
    });
}

function displayResults()
{
    const filteredResults = filterData();

    if(filteredResults.length === 0)
        displayError("There are no jobs available matching your criteria. Please refine your search.",2);
    else
    {
        clearError(2);
        const jobFragment = new DocumentFragment();
        filteredResults.forEach(job => {
            const jobContainer = document.createElement("div");
            jobContainer.classList.add("job-listing");
        
            const jobTopRow = document.createElement("div");
            jobTopRow.classList.add("flex-row");
            const placeholderImg = document.createElement("div");
            const compLogo = document.createElement("div");
            placeholderImg.classList.add("placeholder-img");
            compLogo.classList.add("company-logo");
            compLogo.style.backgroundImage = job.logo;
            placeholderImg.appendChild(compLogo);
            const employerName = document.createElement("em");
            employerName.appendChild(document.createTextNode(job.employer));
            const applyLink = document.createElement("a");
            applyLink.setAttribute("href",job.applyLink);
            applyLink.setAttribute("target","_blank");
            applyLink.appendChild(document.createTextNode("Apply"));
            applyLink.classList.add("apply-button");
            jobTopRow.appendChild(placeholderImg);
            jobTopRow.appendChild(employerName);
            jobTopRow.appendChild(applyLink);
            jobContainer.appendChild(jobTopRow);
        
            const jobTitle = document.createElement("h3");
            jobTitle.appendChild(document.createTextNode(job.title));
            jobContainer.appendChild(jobTitle);
        
            const jobBasicDetails = document.createElement("div");
            jobBasicDetails.classList.add("flex-row", "job-details");
            const salary  = document.createElement("i"); 
            const jobCity = document.createElement("i"); 
            const jobContract = document.createElement("i");
            const seeMoreBtn = document.createElement("a");
      
            if(job.maxSalary > 0)
                salary.appendChild(document.createTextNode(`Up to ${job.displayedSalary} ${job.currency}`));
            else if(job.minSalary > 0)
                salary.appendChild(document.createTextNode(`From ${job.displayedSalary} ${job.currency}`));
            else
                salary.appendChild(document.createTextNode("Competitive"));
    
            jobCity.appendChild(document.createTextNode(job.location));
            jobContract.appendChild(document.createTextNode(job.contract));
            seeMoreBtn.setAttribute("href", "#");
            seeMoreBtn.classList.add("more-button");
            seeMoreBtn.appendChild(document.createTextNode("See More"));
    
            seeMoreBtn.addEventListener("click", e => {
                e.preventDefault();
                jobContainer.classList.toggle("expanded");
                if(jobDescription.classList.contains("hidden"))
                {
                    jobDescription.classList.remove("hidden");
                    seeMoreBtn.innerText = "See Less";
                }
                else
                {
                    jobDescription.classList.add("hidden");
                    seeMoreBtn.innerText = "See More";
                }
            })
    
            jobBasicDetails.appendChild(salary);
            jobBasicDetails.appendChild(jobCity);
            jobBasicDetails.appendChild(jobContract);
            jobBasicDetails.appendChild(seeMoreBtn);
            jobContainer.appendChild(jobBasicDetails);
        
            const jobDescription = document.createElement("div");
            jobDescription.classList.add("job-description");
            jobDescription.classList.add("hidden");
            jobContainer.appendChild(jobDescription);
            jobDescription.innerText = job.description;
        
            jobFragment.appendChild(jobContainer);
        });
       
        searchResults.innerHTML = "";
    
        searchResults.appendChild(jobFragment);        
    }
}

function displayError(errorMsg,index)
{
    errorElements[index].classList.remove("hidden");
    errorElements[index].textContent = errorMsg;
}

function clearError(index)
{
    errorElements[index].classList.add("hidden");
}

function addSearchTag(value)
{
    const newTerm = document.createElement("li");
    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-solid", "fa-circle-xmark", "fa-2xs");
    addDeleteEventListener(deleteIcon);
    newTerm.appendChild(deleteIcon);
    newTerm.appendChild(document.createTextNode(value));
    searchTermsElement.appendChild(newTerm);
    searchTags.push(value);
}

function addDeleteEventListener(deleteIcon)
{
    deleteIcon.addEventListener("click", e => {
        const index = searchTags.indexOf(deleteIcon.parentElement.textContent);
        searchTags.splice(index,1);
        deleteIcon.parentElement.remove();
        localStorage.setItem("search-tags",JSON.stringify(searchTags));
    });
}

function getJobs()
{
    clearError(2);
    resultsSpinner.classList.remove("hidden");
    let url = 'https://jsearch.p.rapidapi.com/search?query=';
    searchTags.forEach(term => {
        url += term;
        url += "%20";
    });

    url += `in%20${country}&page=${pageNumber}&num_pages=1`;

    getJobData(url).then(function(data){
        if(pageNumber === 1)
            jobData = [];
               
        jobData.push(...data);
            
        localStorage.setItem("job_data",JSON.stringify(jobData));
        displayResults();
        pageNumber++;
        localStorage.setItem("page", JSON.stringify(pageNumber));
        if(atBottom)
            atBottom = false;

        resultsSpinner.classList.add("hidden");
        clearError(2);
    }, function(error) {
        resultsSpinner.classList.add("hidden");
        const err = pageNumber === 1 ? "There are no jobs available matching your criteria. Please refine your search." : "There are no more jobs available matching your criteria";
        displayError(err,2);
    });
}

function addSkill()
{
    if(searchBar.value.length >= 2)
    {
        addSearchTag(searchBar.value);
        clearError(0);
        clearError(1);
        localStorage.setItem("search-tags", JSON.stringify(searchTags));
    }
    else
        displayError("Your skill needs to be at least 2 characters long", 0);

    searchBar.value = "";
}

function searchJobs()
{
    if(searchTags.length != 0)
    {
        pageNumber = 1;
        localStorage.setItem("page", pageNumber);
        searchResults.innerHTML = "";
        getJobs();
        document.querySelector(".header > div:nth-child(2)").classList.add("hidden");
        document.querySelector(".header > div:nth-child(1) > h2").classList.add("hidden");
    }
    else
        displayError("Please enter at least one skill",1);
}

searchBar.addEventListener("keypress", e => {
    if(e.key === " ")
    {
        e.preventDefault(); 
        addSkill(e);
    }

    if(e.key === "Enter")
    {
        e.preventDefault(); 
        searchJobs(e);
    }
        
});

window.addEventListener("scroll", e =>
{
    let documentHeight = document.body.scrollHeight;
    let currentScroll = window.scrollY + window.innerHeight;
    let modifier = 200;
    if(currentScroll + modifier > documentHeight && !atBottom && pageNumber > 1)
    {
        atBottom = true;
        getJobs();
    }
});

checkBoxes.forEach(checkBox => {
    checkBox.addEventListener("change", e => {
        e.preventDefault();

        if(checkBox.checked)
            filterOptions[checkBox.id] = true;
        else
            filterOptions[checkBox.id] = false;

        localStorage.setItem("filter_options", JSON.stringify(filterOptions));

        displayResults();
    });
});

salaryDropDowns.forEach(dropDown => {
    dropDown.addEventListener("change", e => {
        e.preventDefault();

        if(dropDown.value !== "any")
            filterOptions[dropDown.id] = parseInt(dropDown.value);
        else
            filterOptions[dropDown.id] = dropDown.id === "minSalary" ? 0 : Number.MAX_VALUE;

        localStorage.setItem("filter_options", JSON.stringify(filterOptions));
            
        displayResults();
    })
})
