const options = 
{
   method: 'GET',
   headers: 
   {
    'content-type': 'application/octet-stream',
    'X-RapidAPI-Key': 'KEY',
    'X-RapidAPI-Host': 'HOST'
   }  //Key and host omitted due to being sensitive data
};

async function getJobData(url)
{
    const jobs = [];

    const response = await fetch(url,options);
    const result = await response.json();

    result.data.forEach(data => {
        const jobObj = {
            employer: data.employer_name,
            title: data.job_title,
            minSalary: data.job_min_salary !== null ? parseInt(data.job_min_salary) : 0,
            maxSalary: data.job_max_salary !== null ? parseInt(data.job_max_salary) : 0,
            displayedSalary: null,
            currency: data.job_salary_currency,
            location: data.job_city !== null ? data.job_city : "Remote",
            contract: data.job_employment_type,
            applyLink: data.job_apply_link,
            logo: data.employer_logo,
            description: data.job_description
        };

        if(jobObj.maxSalary > 0)
            jobObj.displayedSalary = jobObj.maxSalary;
        else
            jobObj.displayedSalary = jobObj.minSalary;

        //Convert contract string to capitalised first letter string
        let firstLetter = jobObj.contract[0];
        let restOfLetters = jobObj.contract.slice(1).toLowerCase();
        jobObj.contract = firstLetter + restOfLetters;
            
        jobs.push(jobObj);
    });

    if(jobs.length === 0)
        throw new Error("No jobs could be loaded");

    return jobs;
}
