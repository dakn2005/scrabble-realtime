CREATE TABLE IF NOT EXISTS "stkresponse" (
	"stkresponse_id" varchar(100) PRIMARY KEY NOT NULL,
	"MerchantRequestID" varchar(100) NOT NULL,
	"CheckoutRequestID" varchar(100) NOT NULL,
	"ResultCode" varchar(10) NOT NULL,
	"ResultDesc" varchar(250),
	"CallbackMetadata" json,
	"createddate" date DEFAULT now() NOT NULL,
	"updatedate" date
);
