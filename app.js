const Crawler = require('crawler');
const temme = require('temme').default;
const _ = require('lodash');
const fs = require('fs');
const os = require('os')

var tempjson = []

var c = new Crawler({
    // 最大并发数默认为10
    maxConnections : 1,
    // This will be called for each crawled page
    // 两次请求之间将闲置100ms
    rateLimit: 100,
    retries: 2,  // 失败重连5次
    
    callback: function (error, res, done) {
        console.log("=========start call back================")
        console.log("error: " + error)
        console.log("res: " + res)
        console.log(res.request)
        if (error) {
            console.log("访问出错: ")
            return console.log(error);
        }
        else{
            

            let json = _.compact(temme(res.body, `[class] td@{a[href=$url]{$text}};`));
            console.log("=====================")
            console.log(res.body)
            console.log(json)
            
            //check if it is not found page
            let $ = res.$;
            let pagetitle = $("title").text()
            console.log(res.request.uri.href)
            console.log(pagetitle)

           
            // if(json.length == 0)
            // {   
            //     console.log("res解析结果为空")
                
            // }
            if(pagetitle == "404 Not Found")
            {
               
                console.log("未找到页面")
                html1 = res.request.uri.href.split("/")[res.request.uri.href.split("/").length - 1]
                target = html1.split(".")[0]
                console.log(target)
                // getRegion(item.url)
                if(target.length == 6)
                {
                    console.log("countytr")
                    let targeturl =  target.substr(0,2)+"/" + target.substr(2,2)+"/"+target+".html"
                    console.log(targeturl)
                    getRegion(targeturl)
                }
                else if(target.length == 9)
                {
                    console.log("towntr")
                    let targeturl =  target.substr(0,2)+"/" + target.substr(2,2)+"/"+target.substr(4,2)+"/"+target+".html"
                    console.log(targeturl)
                    getRegion(targeturl)
                }
            }
            else{
                
                console.log("写数据")

                if(JSON.stringify(json) == JSON.stringify(tempjson)) 
                {
                    console.log("重复数据跳过，注意此逻辑只适用于单线程")
                }
                else{
                    console.log("before write: " + json)
                
                    fs.appendFileSync('region.json', JSON.stringify(json)+ "," +os.EOL);
                    console.log("after write: ")
                    
                    _.forEach(json, item => getRegion(item.url));
                    tempjson = json
                }
                
            }
            
            
        }

        done();
    }

});

getRegion('index.html');

function getRegion(url) {
    const baseUrl = 'http://www.stats.gov.cn/tjsj/tjbz/tjyqhdmhcxhfdm/2016/';

    c.queue(`${baseUrl}${url}`);



    

    
}