const dayjs = require('dayjs');
const { curly } = require('node-libcurl');
require('dotenv/config');

let crud = require('../database/services/crud');

let saf_prefix = 'api'; // process.env['NODE_ENV'] === 'production' ? 'api' : 'sandbox';

let apiSuccessmsg = { status: 'success' }, apiFailedmsg = { status: 'failed' };

let
    c_key = process.env['MPESA_CONSUMER_KEY'],
    c_secret = process.env['MPESA_CONSUMER_SECRET'],
    c_shortcode = process.env['MPESA_STK_SHORTCODE'],
    c_callback_url = process.env['NODE_ENV'] === 'production' ? process.env['MPESA_CALLBACK_URL'] : 'https://1435-105-163-157-127.ngrok-free.app',
    c_passkey = process.env['MPESA_PASSKEY']


async function getAccessToken() {
    let url = `https://${saf_prefix}.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`;

    // const resp = await fetch(url, {
    //     method: 'GET',
    //     headers: {
    //         'Accept': 'application/json',
    //         'Content-Type': 'application/json;charset=UTF-8',
    //         'Authorization': 'Basic ' + Buffer.from(c_key + ':' + c_secret, 'utf8').toString('base64'),
    //         // 'Authorization: Basic '+ c_secret + ':' + c_key
    //     }
    // });

    // const body = await resp.json()

    // return body?.access_token;

    const { statusCode, data, headers } = await curly.get(url, {
        httpHeader: [
            'Accept: application/json',
            'Content-Type: application/json;charset=UTF-8',
            'Authorization: Basic ' + Buffer.from(c_key + ':' + c_secret, 'utf8').toString('base64'),
            // 'Authorization: Basic '+ c_secret + ':' + c_key
        ]
    });

    return data?.access_token;

}

const sleep = ms => new Promise((resolve) => { setTimeout(resolve, ms) });

async function PostMpesa (request) {
    let url = `https://${saf_prefix}.safaricom.co.ke/mpesa/stkpush/v1/processrequest`;
    let cust_timestamp = dayjs().format('YYYYMMDDHHmmss');
    let pwd = Buffer.from(c_shortcode + c_passkey + cust_timestamp).toString('base64');

    let access_token = await getAccessToken();

    let amount = request.body.amount;


    // let leInvoice = null;
    // leInvoice = await BiasharaInvoice.query().findOne('invoice_code_number', request.body.accountref ?? '');

    // if (!leInvoice)
    //     return {
    //         status: 200,
    //         body: {
    //             message: 'Invoice reference for this payment not found'
    //         }
    //     }

    let mwili = {
        "BusinessShortCode": c_shortcode,
        "Password": pwd,
        "Timestamp": cust_timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": request.body.phone,
        "PartyB": c_shortcode,
        "PhoneNumber": request.body.phone,
        "CallBackURL": c_callback_url + '/api/coffee/mpesa/feedback',
        "AccountReference": 'DAVID', //request.body.accountref,
        "TransactionDesc": "Buy me a Coffee"
    }


    let resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            'Authorization': 'Bearer ' + access_token,
        },
        body: JSON.stringify(mwili)
    });

    let data = await resp.json();

    // console.log('callback url: ', c_callback_url)
    // console.log('malippo: ', data);

    // return

    let boolcheck = true;
    let check_cnt = 0;

    // let starttime = dayjs();
    let stkresp_rec;
    while (boolcheck && check_cnt <= 40) {
        await sleep(1500);

        stkresp_rec = await crud.getStk(data?.CheckoutRequestID); //await stkReponse.query().findOne('CheckoutRequestID', data.CheckoutRequestID);

        if (stkresp_rec) {

            // leInvoice = await BiasharaInvoice.query().patchAndFetchById(leInvoice.biashara_invoice_id, {
            //     invoice_status: stkresp_rec.ResultCode == 0 ? EnumInvoiceStatus.paid : leInvoice.invoice_status
            // });

            boolcheck = false;

        } else {
            check_cnt++;
        }
    }

    let response = null;
    // console.log('diff ', dayjs().diff(starttime, 'second'));
    // console.log(check_cnt)

    if (check_cnt == 41) {
        apiFailedmsg['message'] = 'Server Timeout';
        response = apiFailedmsg
    } else {
        if (!boolcheck && stkresp_rec && stkresp_rec.ResultCode == '0') {            
            if (stkresp_rec && stkresp_rec.ResultCode == '0') {
                apiSuccessmsg['message'] = 'Thanks for the support, much appreciated. You can close the page when done';
                response = apiSuccessmsg;
            }
            else {
                apiFailedmsg['message'] = 'Unfortunately, the transaction failed. Please feel free to try again';
                response = apiFailedmsg
            }
        }
    }


    return {
        status: 200,
        body: {
            response
        }
    }
}

module.exports = {
    PostMpesa
}