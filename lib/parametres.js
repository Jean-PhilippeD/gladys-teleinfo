
module.exports = {
    
    folderName: 'teleinfo',
    // Inject Boxs in dashboard
    // dashboadBoxs is an array of dashboardBox 
    dashboardBoxs: [{
        title: 'TeleInfo',
        // the name of your Angular Controller for this box (put an empty string if you don't use angular)
        ngController: 'teleinfoController as vm',
        file : 'box.ejs',
        icon: 'fa fa-play',
        type: 'box-primary'
    }],
    // link assets to project
    linkAssets: true
};
