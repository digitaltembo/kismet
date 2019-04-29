import React from 'react';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {white, grey300, darkBlack, fullBlack} from 'material-ui/styles/colors';
import {fade} from 'material-ui/utils/colorManipulator';


/* application components */
import { Footer } from '../../components/Footer';

/* global styles for app */
import './styles/app.scss';

const theme = getMuiTheme({
	palette: {
	    primary1Color: '#ff6b6b',
    	primary2Color: '#ff9d99',
    	primary3Color: '#c73840',
    	accent1Color: '#d81b60',
    	accent2Color: '#ff5c8d',
    	accent3Color: '#a00037',
    	textColor: darkBlack,
    	alternateTextColor: white,
    	canvasColor: white,
    	borderColor: grey300,
    	disabledColor: fade(darkBlack, 0.3),
    	pickerHeaderColor: '#ff9d99',
    	clockCircleColor: fade(darkBlack, 0.07),
    	shadowColor: fullBlack
    }
});

class App extends React.Component { // eslint-disable-line react/prefer-stateless-function
  	static propTypes = {
        children: React.PropTypes.node,
    };

    render() {
        return (
            <MuiThemeProvider muiTheme={theme}>
                <section>
                    <div
                      className="container"
                      style={{ marginTop: 10, paddingBottom: 250 }}
                    >
                        {this.props.children}
                    </div>
                    <div>
                        <Footer />
                    </div>
                </section>
            </MuiThemeProvider>
        );
    }
}

export { App };
