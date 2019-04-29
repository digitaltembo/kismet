import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/auth';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import Chip from 'material-ui/Chip';
import AutoComplete from 'material-ui/AutoComplete';
import RaisedButton from 'material-ui/RaisedButton';
import { get_book_authors, get_book_genres, get_book_series, get_book_countries, get_book_languages, get_book_original_languages } from '../../utils/http_functions';
import { parseJSON } from '../../utils/misc';
import Link from '../Link';

class FileInput extends React.Component {
    constructor() {
        super();
        this.state = {
            files: []
        };
        this.styles = {
            button: {
                margin: 12,
            },
            exampleImageInput: {
                cursor: 'pointer',
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                width: '100%',
                opacity: 0,
            },
        };
    }
    handleRemove = (lastModified) => {
        this.setState({files: this.state.files.slice().filter((file) => file.lastModified != lastModified)});
        this.props.onChange(this.state.files);
    };
    handleAdd = (event) => {
        this.setState({files: [...this.state.files, event.target.files[0]]});
        this.props.onChange(this.state.files);
    };

    shorten(filename) {
        if(filename.length < 20){
            return filename;
        } else {
            const parts = filename.split(".");
            const first = parts.slice(0, parts.length - 1).join("");
            const extension = parts[parts.length - 1];
            return first.substring(0, 17-extension.length) + "..." + extension;
        }
    }
    

    render() {
        return (
            <Paper style={{width:"300px"}}>
                {this.state.files.map( (file) => ( 
                    <Chip 
                        key={file.lastModified} 
                        onRequestDelete={() => this.handleRemove(file.lastModified)}
                        style={{float:"left"}}
                    >
                        {this.shorten(file.name)}
                    </Chip>
                ))}
                <br/>
                <RaisedButton
                      label={this.props.label}
                      labelPosition="before"
                      containerElement="label"
                      style={this.styles.button}
                >
                  <input type="file" style={this.styles.exampleImageInput} onChange={(event) => this.handleAdd(event)} multiple={true}/>
                </RaisedButton>
            </Paper>
        )
    }
}

export default class BookUploader extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor() {
        super();
        this.suggestion_types = {
            author_suggestions: get_book_authors,
            genre_suggestions: get_book_genres,
            series_suggestions: get_book_series,
            country_suggestions: get_book_countries,
            language_suggestions: get_book_languages,
            original_language_suggestions: get_book_original_languages
        };

        this.state = {
            author_suggestions: [],
            genre_suggestions: [],
            series_suggestions: [],
            country_suggestions: [],
            language_suggestions: [],
            original_language_suggestions: [],
            title: "",
            author: "",
            author_sort: "",
            genre: "",
            series: "",
            series_number: "",
            country: "",
            original_language: ""
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        const token = this.props.token;
        Object.keys(this.suggestion_types).forEach( (key) => {
            this.suggestion_types[key](token)
                .then(parseJSON)
                .then(response => {
                    this.setState({[key]: response});
                })
        });
    }

    handleBookFileChange = (files) => {
        this.setState({bookFiles: files});
    }

    render() {
        return (
            <form>
                <TextField 
                    floatingLabelText="Title*" 
                    hintText="East of Eden" 
                    errorText={(this.state.title=='') ? "Must include Title" : ""} 
                    onChange={(event, newValue) => this.setState({title: newValue})}
                    value={this.state.title}
                /> <br/>
                <AutoComplete
                    floatingLabelText="Author*"
                    hintText="John Steinbeck" 
                    filter={AutoComplete.fuzzyFilter}
                    dataSource={this.state.author_suggestions.map( (a) => a[0])}
                    maxSearchResults={5}
                    errorText={(this.state.author=='') ? "Must include Author" : ""} 
                    onNewRequest={(chosen, suggestedIndex) => ((suggestedIndex != -1) ? 
                        this.setState({author_sort: this.state.author_suggestions[suggestedIndex][1]}) :
                        {}
                    )}
                    onUpdateInput={(text) => this.setState({author: text})}
                /> <br/>
                <TextField 
                    floatingLabelText="Author Sort" 
                    hintText="Steinbeck, John" 
                    value={this.state.author_sort}
                    onChange={(event, newValue) => this.setState({author_sort: newValue})}
                /> <br/>
                <AutoComplete
                    floatingLabelText="Genre"
                    filter={AutoComplete.fuzzyFilter}
                    dataSource={this.state.genre_suggestions}
                    maxSearchResults={5}
                    onChange={(event, newValue) => this.setState({genre: newValue})}
                    value={this.state.genre}
                /> <br/>
                <AutoComplete
                    floatingLabelText="Series"
                    filter={AutoComplete.fuzzyFilter}
                    dataSource={this.state.series_suggestions}
                    maxSearchResults={5}
                    onUpdateInput={(text) => this.setState({series: text})}
                    value={this.state.series}
                />
                { (this.state.series != "") &&
                    <div>
                    <TextField 
                        floatingLabelText="Number in Series" 
                        hintText="1" 
                        type="number"
                        value={this.state.series_number}
                        onChange={(event, newValue) => this.setState({series_number: newValue})}
                        errorText={(this.state.series_number=='') ? "Number required if series specified" : ""} 
                    /> 
                    </div>
                } <br/>


                <AutoComplete
                    floatingLabelText="Country"
                    filter={AutoComplete.fuzzyFilter}
                    dataSource={this.state.country_suggestions}
                    maxSearchResults={5}
                    onChange={(event, newValue) => this.setState({country: newValue})}
                    value={this.state.country}
                /> <br/>
                <AutoComplete
                    floatingLabelText="Original Language"
                    filter={AutoComplete.fuzzyFilter}
                    dataSource={this.state.original_language_suggestions}
                    maxSearchResults={5}
                    onChange={(event, newValue) => this.setState({original_language: newValue})}
                    value={this.state.original_language}
                /> <br/>

                <FileInput
                    multiple={true}
                    label="Add Book File"
                    onChange={this.handleBookFileChange}
                />


            </form>
        );
    }
}
