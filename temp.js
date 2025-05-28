new sap.m.HBox({
    items: [
        new sap.m.RadioButton({
            text: "A",
            groupName: "{SN}1", // Ensures only one selection per row
            select: function () {
                sap.ui.getCore().getModel().setProperty(this.getBindingContext().getPath() + "/u1v", "A");
            }
        }),
        new sap.m.RadioButton({
            text: "B",
            groupName: "{SN}1",
            select: function () {
                sap.ui.getCore().getModel().setProperty(this.getBindingContext().getPath() + "/u1v", "B");
            }
        }),
        new sap.m.RadioButton({
            text: "C",
            groupName: "{SN}1",
            select: function () {
                sap.ui.getCore().getModel().setProperty(this.getBindingContext().getPath() + "/u1v", "C");
            }
        }),
        new sap.m.RadioButton({
            text: "D",
            groupName: "{SN}1",
            select: function () {
                sap.ui.getCore().getModel().setProperty(this.getBindingContext().getPath() + "/u1v", "D");
            }
        }),
        new sap.m.RadioButton({
            text: "E",
            groupName: "{SN}1",
            select: function () {
                sap.ui.getCore().getModel().setProperty(this.getBindingContext().getPath() + "/u1v", "E");
            }
        }),
        new sap.m.RadioButton({
            text: "F",
            groupName: "{SN}1",
            select: function () {
                sap.ui.getCore().getModel().setProperty(this.getBindingContext().getPath() + "/u1v", "F");
            }
        }).addStyleClass("blackText")
    ],
    justifyContent: "SpaceBetween"
})	,






// Single check 


new sap.m.CheckBox({
    selected: {
        path: "u1v",
        formatter: function(value) {
            return value === "true" || value === true; // Convert string to boolean
        }
    },
    select: function(oEvent) {
        console.log("Checkbox 1 state changed: ", oEvent.getParameter("selected"));
    }
}),


// Yes or No check box 
new sap.m.HBox({
    items: [
        new sap.m.RadioButton({
            text: "Yes",
            groupName: "{SN}1", // Ensures only one selection per row
            select: function () {
                sap.ui.getCore().getModel().setProperty(this.getBindingContext().getPath() + "/u1v", "Yes");
            }
        }),
        new sap.m.RadioButton({
            text: "No",
            groupName: "{SN}1",
            select: function () {
                sap.ui.getCore().getModel().setProperty(this.getBindingContext().getPath() + "/u1v", "No");
            }
        }),
        
    ],
    justifyContent: "SpaceBetween"
    })	,
    new sap.m.HBox({
        items: [
            new sap.m.RadioButton({
                text: "Yes",
                groupName: "{SN}2", // Ensures only one selection per row
                select: function () {
                    sap.ui.getCore().getModel().setProperty(this.getBindingContext().getPath() + "/u1v", "Yes");
                }
            }),
            new sap.m.RadioButton({
                text: "No",
                groupName: "{SN}2",
                select: function () {
                    sap.ui.getCore().getModel().setProperty(this.getBindingContext().getPath() + "/u1v", "No");
                }
            }),
            
        ],
        justifyContent: "SpaceBetween"
    })	,








    // checked

    new sap.m.HBox({
        items: [
            new sap.m.CheckBox({
                selected: {
                    path: "u1v",
                    formatter: function (value) {
                        return value === "true" || value === true; // Convert string to boolean
                    }
                },
                select: function (oEvent) {
                    console.log("Checkbox 1 state changed: ", oEvent.getParameter("selected"));
                }
            }),
            new sap.m.Text({
                text: "Checked",
            })
        ],
        alignItems:"Center",
        
    }),
    new sap.m.HBox({
        items: [
            new sap.m.CheckBox({
                selected: {
                    path: "u2v",
                    formatter: function (value) {
                        return value === "true" || value === true; // Convert string to boolean
                    }
                },
                select: function (oEvent) {
                    console.log("Checkbox 2 state changed: ", oEvent.getParameter("selected"));
                }
            }),
            new sap.m.Text({
                text: "Checked",
                
            })
        ],
        alignItems:"Center",
        
    })