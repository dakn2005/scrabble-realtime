export default function errorHandling(errCode: any, entityName: string) {
    switch(errCode){
        case '23505':
            return `${entityName} already exists`
        default:
            return 'Error saving the record'
    }
}