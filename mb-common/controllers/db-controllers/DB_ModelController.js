
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const base64 = require('base-64');
const BaseController = require('../BaseController');
const Errors = require('common/Errors.js');

class DBModelController extends BaseController{
  constructor(db_type){
    super("DBModelController_" + db_type.tableName);

    this.db_type = db_type;
  }

  get_table_name = ()=>{
    return this.db_type.tableName;
  }

  get = async(req, res, on_success, on_error)=>{
    const id = req.params.id.replace(":", "");
    await this.find_model(id, (model)=>{
      if(on_success != null){
        on_success(model);
      }
    }, on_error, res);
  }

  get_all = async(req, res, on_success, on_error)=>{
    var page = 0;
    var limit = 100;

    if(req.params != null){
      if(req.params.page != null){
        page = req.params.page;
      }

      if(req.params.limit != null){
        page = req.params.limit;
      }
    }
    else
    if(req.body != null){
      if(req.body.page != null){
        page = req.body.page;
      }

      if(req.body.limit != null){
        page = req.body.limit;
      }
    }

    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    await db_type.findAll({group: 'id'})
      .then(data =>{
        var models = [];
        const end = (page + limit < data.length) ? page + limit: data.length;
        var start = (page < data.length) ? page : data.length - (data.length % limit);
        if(start < 0){
          start = 0;
        }

        for(var i=start; i < end; ++i){
          models.push(data[i].dataValues);
        }

        const result_data ={
          data: models,
          total_data_length: models.length
        };

        if(res != null){
          this.send_json_response(result_data, res);
        }

        // console.log(db_table_name + " find_all_models - data: ", models);
        if(on_success != null){
          on_success(result_data);
        }
      })
      .catch(err =>{
        console.log(err);
        if(on_error != null){
          on_error(err);
        }

        if(res != null){
          res.status(500).send({
            message:
              err.message || `Some error occurred while retrieving ${db_table_name}.`
          });
        }
      });
  }

  get_all_lim = async(limit)=>{
    if(limit == null){
      limit = 20;
    }
    
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    const data = await db_type.findAll({group: 'id', limit})
    
    var models = [];
    for(var i = 0; i < data.length; ++i){
        models.push(data[i].dataValues);
    }
    
    return models;
  }

  get_all_where = async(attributes, res, start_page=0, per_page=10)=>{
    return await this.find_all_models(attributes, res, start_page, per_page);
  }

  get_model_like = async(field, value)=>{
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    const where = {};
    where[field] = { [Op.like]: '%' + value + '%' };

    const record = await db_type.findOne({ where });
    if(record != null){
      return record.dataValues;
    }
    return null;
  }

  get_all_like = async(field, value, page, per_page)=>{
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    const where = {};
    where[field] = { [Op.like]: '%' + value + '%' };

    const query = { where };

    if(per_page > 0){
      query.limit = per_page;
      query.offset = page * per_page;
    }

    const records = await db_type.findAll(query);

    var models = [];
    for(var i = 0; i < records.length; ++i){
        models.push(records[i].dataValues);
    }
    
    return models;
  }

  post = async(req, res)=>{
    const db_type = this.db_type;
    const post_data = req.body;

    await this.create_model(post_data, (data)=>
    {
      console.log("Created " + db_type.tableName + " record");
      console.log(data.dataValues);
    }, null, res);
  }

  put = async(req, res)=>{
    const db_type = this.db_type;
    const id = req.params.id;
    const data = req.post.body;

    await this.update_model(id, data);
  }

  delete_all = async(success, error, res)=>{
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    await db_type.destroy({ where: {}, truncate: false });
  }

  delete_all_where = async(where)=>{
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    await db_type.destroy({where: where, truncate: false});      
  }

  get_latest_model = (attributes)=>{
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    const model = db_type.findAll({
        limit: 1,
        where: attributes,
        order: [ [ 'updatedAt', 'DESC' ]]
      });
      return model;
  }

  get_model = async(id)=>{
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    try{
      const model = await this.db_type.findOne({where:{id}});
      if(model != null){
        return model.dataValues;
      }
      return null;
    }
    catch(error){
      console.log(db_table_name + " - get_model - ERROR: ",  error);
      throw new Errors.InternalServerError(error);
    }
  }

  get_model_where = async(where) => {
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    try{
      const result = await db_type.findOne({where:where});
      if(result != null){
        return result.dataValues;
      }
      return null;
    }
    catch(error){
      console.log(db_table_name + " - get_model_where - ERROR: ",  error);
      throw new Errors.InternalServerError(error);
    }
  }

  find_all_models_that_include = async(attributes, limit=10)=>{
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    const data = await db_type.findAll({ where: {attributes}, limit });
    var models = [];
    for(var i = 0; i < data.length; ++i){
        models.push(data[i].dataValues);
    }  
  };

  find_all_models = async(attributes, res, start_page=0, per_page=0)=>{
    try{
        const db_type = this.db_type;
        const db_table_name = db_type.tableName;

        const query = { where: attributes };

        if(per_page > 0){
            query.limit = per_page;
            query.offset = start_page * per_page;
        }

        const data = await db_type.findAll(query);
        const models = data.map(record => record.dataValues);

        return models;
    }
    catch(error){
        console.log(error);
        if(res != null){
            res.status(500).send({
                message: error.message || `Some error occurred while retrieving ${db_type.tableName}.`
            });
        }
        return null;
    }
  };

  create_model = async(data, res)=>{
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    try{
      if(data == null){
        const error_msg = `create_model - Error: data is null while creating ${db_table_name} record.`;
        console.log(error_msg);
        if (res != null){
          res.status(400).send({ error: error_msg });
        }
        return null;
      }

      const saved_data = await db_type.create(data);
      if(res != null){
        res.send(saved_data.dataValues);
      }

      return saved_data;
    }
    catch (error){
      const error_msg = `create_model - Exception while creating ${db_table_name}: ${error}`;
      console.log(error_msg);

      if (res != null)
      {
        res.status(500).send({ error: error_msg });
      }
      return null;
    }
  };

update_model = async(id, data, res)=>{
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    if(data == null){
      const error_msg = `create_model - Error: \nERROR, data is null!\nwhile creating ${db_table_name} record.`;
      console.log(error_msg);
      if(on_error != null){
        on_error(error);
      }
      return;
    }

    await this._update_model(id, data, async(success_msg)=>{
      if(on_success != null){
        await this.get_model(id, (model)=>{
          if(res != null){
            res.send({ message: success_msg });
          }
        });
      }
    }),
    (error)=>{
      console.log("update_model - ERROR: ", error);
      console.log("data: ", data);
      if(res != null){
        res.send({ message: error });
      }
    };
  }

  update_model = async(id, data)=>{
    const db_type = this.db_type;

    try{
      const num = await db_type.update(data, {where: {id: id}});
      return num;
    }
    catch(error){
      const db_table_name = db_type.tableName;
      console.log(`update_model2 - Error updating ${db_table_name} with id=` + id);
      console.log('\nERROR: ', error.original.sqlMessage);
      console.log("data: ", data);
    }
  }

  delete_model = (req, res)=>{
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;
    
    if(req.params != null){
      const id = req.params.id;
      if(req.params != null){
        if(id != null){
          console.log(`Deleting ${db_table_name} with id: `, id);
          this.delete_model_by_id(id, null, null, res);
        }
      }
    }
  }

  delete_model_by_id = async(id, res)=>{
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    if(id != null){
      db_type.destroy({
        where: { id: id }
      })
        .then(num =>{
            if(num == 1){
              const success_msg = `${db_table_name} with id: ${id} was deleted successfully!`;
                if(res != null){
                    res.send({ message: success_msg });
                }
              }
              else{
                const error_msg = `Cannot delete ${db_table_name} with id=${id}. Maybe ${db_table_name} was not found?`;
                if(res != null){
                    res.send({ message: error_msg });
                }
            }
        })
        .catch(err =>{
            const error_msg = `Could not delete ${db_table_name} with id=` + id;
            if(res != null){
              res.send({ message: error_msg });
            }
        });
      }
  }

  describe = async()=>{
    const db_type = this.db_type;
    const db_table_name = db_type.tableName;

    const desc = await db_type.describe();
    console.log("Describe " + db_table_name + ": ");
    console.log(desc);
  }

  set_error_status = (res, json)=>{
    res.status(json.error).json({ error_message: json.error_message });
  }
}

module.exports = DBModelController;
