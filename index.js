const PAGE_TO_PARSE = 'https://hh.ru/search/vacancy?hhtmFrom=main&hhtmFromLabel=vacancy_search_line&search_field=name&search_field=company_name&search_field=description&text=React&enable_snippets=false&L_save_area=true'
const PEGE_LOGIN = 'https://hh.ru/account/login?backurl=%2F&hhtmFrom=main'
const HH_USERNAME = ''
const HH_PASSWORD = ''
import puppeteer, { ElementHandle } from 'puppeteer';

async function waitAndClick(selector) {
  console.log('Ждём пояление элемента: ', selector);
  await page.waitForSelector(selector, { visible: true });
  console.log(`Элемент ${selector} на экране`);
  await page.click(selector);
  console.log(`Нажал на ${selector}`);
}

const browser = await puppeteer.launch({ headless: false }); // Запуск в не-головном режиме
const page = await browser.newPage();
await page.setDefaultTimeout(0);

await page.goto(PEGE_LOGIN);
waitAndClick('[data-qa="expand-login-by-password"]')
waitAndClick('data-qa="account-signup-email"')
await page.waitForSelector('[data-qa="login-input-username"]', { visible: true });
await page.type('[data-qa="login-input-username"]', HH_USERNAME)
waitAndClick('data-qa="login-input-password"')
await page.type('[data-qa="login-input-password"]', HH_PASSWORD)
waitAndClick('[data-qa="account-login-submit"]')
await page.waitForNavigation();
await page.goto(PAGE_TO_PARSE);

await page.waitForSelector('a[data-qa="vacancy-serp__vacancy_response"]');

// Получаем все элементы с указанным селектором
const buttons = await page.$$('a[data-qa="serp-item__title"]');

// Перебираем и кликаем по каждой кнопке
for (let i = 0; i < buttons.length; i++) {
  console.log(i)
  try {
    // Прокручиваем к кнопке, чтобы она была в зоне видимости
    await buttons[i].scrollIntoViewIfNeeded({ behavior: 'smooth', block: 'center' });
    const linkUrl = await page.evaluate(element => element.getAttribute('href'), buttons[i]);
    console.log(linkUrl)
    const nnpage = await browser.newPage();
    await nnpage.goto(linkUrl)
    const otkl = await nnpage.$('a[data-qa="vacancy-response-link-top"]');
    await otkl.click()
    await new Promise(resolve => setTimeout(resolve, 2000));
    await nnpage.close()
    // await page.waitForTimeout(1000)
  } catch (error) {
    // await page.goBack();
    console.error(`Ошибка при клике по кнопке ${i + 1}:`, error);
  }
}

await browser.close(); // Закрываем браузер