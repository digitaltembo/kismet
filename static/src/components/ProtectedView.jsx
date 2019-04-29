import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {GridList, GridTile} from 'material-ui/GridList';
import { browserHistory } from 'react-router';

export default class ProtectedView extends React.Component {

    render() {
        return (
            <GridList>
                <GridTile
                    title="Books"
                    onClick={() => browserHistory.push("/books")}
                    style={{
                        cursor:"pointer"
                    }}
                >
                    <img src="/books.jpg"/>
                </GridTile>
                <GridTile
                    title="Movies"
                    onClick={() => browserHistory.push("/movies")}
                    style={{
                        cursor:"pointer"
                    }}
                >
                    <img src="/films.jpg"/>
                </GridTile>
                <GridTile
                    title="Music"
                    onClick={() => browserHistory.push("/music")}
                    style={{
                        cursor:"pointer"
                    }}
                >
                    <img src="/records.jpg"/>
                </GridTile>
                <GridTile
                    title="Documents"
                    onClick={() => browserHistory.push("/docs")}
                    style={{
                        cursor:"pointer"
                    }}
                >
                    <img src="/docs.jpeg"/>
                </GridTile>
            </GridList>
        );
    }
}

