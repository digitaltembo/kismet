import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from '../../actions/auth';
import Table from 'material-ui/Table/Table';
import TableBody from 'material-ui/Table/TableBody';
import TableRowColumn from 'material-ui/Table/TableRowColumn';
import TableHeaderColumn from 'material-ui/Table/TableHeaderColumn';
import TableHeader from 'material-ui/Table/TableHeader';
import TableRow from 'material-ui/Table/TableRow';
import Checkbox from 'material-ui/Checkbox';
import { get_books } from '../../utils/http_functions';
import { parseJSON } from '../../utils/misc';
import Link from '../Link';

function mapStateToProps(state) {
    return {
        isAdmin: state.auth.isAdmin
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(actionCreators, dispatch);
}

@connect(mapStateToProps, mapDispatchToProps)
class Books extends React.Component { // eslint-disable-line react/prefer-stateless-function
    constructor() {
        super();
        this.state = {
            books: [] 
        };
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        const token = this.props.token;
        get_books(token)
            .then(parseJSON)
            .then(j => {console.log(j); return j})
            .then(response => {
                this.setState({books: response});
            })
    }

    render() {
        const books = this.state.books;
        const numSelected = 0;
        const rowCount = books.length;
        const onSelectAllClick = () => 0;
        return (
            <div className="col-md-8">
                {
                    (this.props.isAdmin) ? (
                        <h1>
                            Books 
                            <Link 
                                href="/upload#books" 
                                title="Upload Books"
                            >(<i className="fas fa-cloud-upload-alt"></i>)</Link>
                        </h1>
                    ) : <h1>Books</h1>
                }
                <hr />
                <Table className="books" aria-labelledby="books" multiSelectable={true}>
                    <TableHeader enableSelectAll={true}>
                        <TableRow>
                            <TableHeaderColumn>title</TableHeaderColumn>
                            <TableHeaderColumn>author</TableHeaderColumn>
                            <TableHeaderColumn>files</TableHeaderColumn>

                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {books.map( book => (
                        <TableRow key={book.id}>
                            <TableRowColumn>{book.title}</TableRowColumn>
                            <TableRowColumn>{book.author}</TableRowColumn>
                            <TableRowColumn>{book.files}</TableRowColumn>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>

            </div>
        );
    }
}

export default Books;
