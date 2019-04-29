import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import BookUploader from './Books/BookUploader';

export default class Uploader extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor(props) {
        super(props);
        this.selections = ['books', 'movies', 'music'];
        this.state = {
            value: this.selections[0]
        };
    }

    componentDidMount(){
        const potentialSelected = this.selections.indexOf(window.location.hash.toLowerCase());

        if(potentialSelected != -1){
            this.setState({ value: this.selections[potentialSelected]});
        }
    }


    handleChange = (value) => {
        window.location.hash=value;
        this.setState({
            value: value,
        });
    };

    render() {
        return (
            <Tabs value={this.state.value} onChange={this.handleChange} >
                <Tab label="Books" value="books" icon={<i className="fas fa-book"></i>}>
                    <BookUploader token={this.props.token}></BookUploader>
                </Tab>
                <Tab label="Movies" value="movies" icon={<i className="fas fa-film"></i>}>
                    Movie Uploader
                </Tab>
            </Tabs>
        );
    }
}
