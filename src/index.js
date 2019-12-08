const getUrls = require("get-urls");
const got = require('got');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
let md = new MarkdownIt();


/**
 * 检测 URL 可用性
 * 
 * Note: 这里原本打算使用 status-is-ok 这个 package，后续 review 库的代码时发现，其使用的是 get， 而不是 head，所以决定自己来做。
 */
async function isValid(url,validateState = [200,201]){
   return await got.head(url).then(res => {
      if(validateState.indexOf(res.statusCode) != -1){
         return true
      }else{
         return false;
      }
   }).catch((error) => {
      return false;
   })

}

module.exports = (options, ctx) => {
  return {
    name: "vuepress-plugin-404found",
    async ready() {
      /**
       * 提取所有的 Page
       */
      let pages = ctx.pages;
      /**
       * 遍历所有的 URL
       */
      pages.forEach(async page => {
        let relativePath = page.relativePath;
        /**
         * 提取所有的 URL
         * 
         * @TODO 由于 Plugin 中拿不到渲染后的 HTML，所以自行渲染一次，可能是因为用错了生命周期。
         */
        let linksToCheck = getUrls(md.render(page._strippedContent),{normalizeProtocol: false,stripWWW:false});
        linksToCheck.forEach(async (item)=>{
           /**
            * 检测与输出放在一起
            */
           if(await isValid(item,options.allowState)){
            // do nothing
           }else{

            /**
             * @todo 此处应该有一个可以自定义化的格式
             */
            console.log('Invalid Url:',item);

            if(options.fileName){
               fs.appendFileSync(options.fileName, `Invalid Url ${item} at ${relativePath}\r\n`);
            }
           }
        })
      });
    }
  };
};
