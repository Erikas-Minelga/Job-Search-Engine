async function getCountry(url)
{
    try
    {
        const data = await fetch(url);
        const result = await data.json();

        const longName = result.plus_code.compound_code;

        const nameSplit = longName.split(" ");

        return nameSplit[2];
    }
    catch(err)
    {
        return err;
    }
}