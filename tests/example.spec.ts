import { test, expect, request } from '@playwright/test';
import tags from '../request/tags.json';
import article from '../request/article.json';
import login from '../request/login.json';

test.beforeEach(async({page})=>{
  await page.route('https://conduit-api.bondaracademy.com/api/tags',async route=>{
   
      await route.fulfill({
        body:JSON.stringify(tags)
      })
  }
  )

  await page.route('https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0',async route=>{
    const response = await route.fetch()
    //console.log(response)
    const responseBody =  await response.json()
   // console.log(responseBody)
    responseBody.articles[0].title = "This is Aaditya"
    responseBody.articles[0].description = "This is my Description"

    await route.fulfill({
      body:JSON.stringify(responseBody)
    })

  })
})

test('has title', async ({ page }) => {
  await page.goto('https://conduit.bondaracademy.com/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Conduit");
  await page.waitForTimeout(15000);
});

test('get token',async({page, request})=>{
 const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login',{
data:{"user":{"email":"mangotest@gmail.com","password":"orange"}}
 }
)
const responseBody = await response.json()
console.log(responseBody)
const accessToken = responseBody.user.token;

console.log(accessToken)

const response1 = await request.post('https://conduit-api.bondaracademy.com/api/articles/',{
  data:article,
  headers:{
    Authorization:"Token "+accessToken
  }
})

expect(response1.status()).toEqual(201)
const responseBody1 = await response1.json()
console.log(responseBody1.article.slug)
const slug = responseBody1.article.slug


const response2 = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slug}`,{
  headers:{
    Authorization:"Token "+accessToken
  }
})
expect(response2.status()).toEqual(204)





})

test('create article',async({page})=>{
await page.route('https://conduit-api.bondaracademy.com/api/articles/',async route=>{
  await route.fulfill({
    body:JSON.stringify(article)
  })
})
});


